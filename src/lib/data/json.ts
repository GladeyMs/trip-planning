import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data');
const fileLocks = new Map<string, Promise<void>>();

/**
 * Ensures the data directory exists
 */
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Read JSON data from a file
 */
export async function readJson<T>(filename: string): Promise<T | null> {
  await ensureDataDir();
  const filePath = join(DATA_DIR, filename);

  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write JSON data to a file
 */
export async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Update JSON file with a mutex lock to prevent race conditions
 * The updater function receives the current data and returns the new data
 */
export async function updateJson<T>(
  filename: string,
  updater: (current: T | null) => T | Promise<T>
): Promise<T> {
  // Wait for any existing lock on this file
  const existingLock = fileLocks.get(filename);
  if (existingLock) {
    await existingLock;
  }

  // Create a new lock
  let resolveLock: () => void;
  const lock = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });
  fileLocks.set(filename, lock);

  try {
    // Read current data
    const current = await readJson<T>(filename);

    // Apply updater
    const updated = await updater(current);

    // Write back
    await writeJson(filename, updated);

    return updated;
  } finally {
    // Release lock
    fileLocks.delete(filename);
    resolveLock!();
  }
}

/**
 * Initialize a collection file if it doesn't exist
 */
export async function initCollection<T>(filename: string, defaultValue: T): Promise<T> {
  const existing = await readJson<T>(filename);
  if (existing) {
    return existing;
  }
  await writeJson(filename, defaultValue);
  return defaultValue;
}
