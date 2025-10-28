import { readJson, updateJson, initCollection } from './json';
import { Settings } from '../schemas';

const SETTINGS_FILE = 'settings.json';

export async function initSettings(): Promise<Settings> {
  return initCollection<Settings>(SETTINGS_FILE, { version: 1, defaultCurrency: 'USD' });
}

export async function getSettings(): Promise<Settings> {
  const settings = await readJson<Settings>(SETTINGS_FILE);
  if (!settings) {
    return initSettings();
  }
  return settings;
}

export async function updateSettings(
  updates: Partial<Omit<Settings, 'version'>>
): Promise<Settings> {
  return updateJson<Settings>(SETTINGS_FILE, (current) => {
    const settings = current || { version: 1, defaultCurrency: 'USD' };
    return { ...settings, ...updates, version: settings.version + 1 };
  });
}
