# Trip PlannerThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

A minimal, personal-only trip planning application built with Next.js 15, TypeScript, Ant Design, and file-based storage. Plan your trips, organize activities, manage transportation, and track your budget—all without authentication or external databases.## Getting Started

## FeaturesFirst, run the development server:

- 📝 **Trip Management**: Create, edit, and delete trips with destination and date information```bash

- 📅 **Day Planning**: Add and reorder days within your tripsnpm run dev

- ✅ **Activities**: Add, edit, delete, and reorder activities with time, cost, and notes# or

- 🚗 **Transportation**: Track transport between activities with mode, cost, duration, and distanceyarn dev

- 💰 **Budget Tracking**: Automatic calculation of total costs (activities + transportation)# or

- 🗺️ **Optional Map**: Mapbox integration (works without API key)pnpm dev

- 🌐 **i18n**: English and Thai language support# or

- 📦 **File-based Storage**: All data stored in local JSON files—no database requiredbun dev

- 🔄 **Drag & Drop**: Reorder activities within days```

- 📊 **Distance & Duration Estimation**: Automatic calculations using Haversine formula

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Framework**: Next.js 15 (App Router) with Turbopack

- **Runtime**: BunThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **Language**: TypeScript

- **UI**: Ant Design + @ant-design/icons## Learn More

- **Validation**: Zod

- **Dates**: Day.jsTo learn more about Next.js, take a look at the following resources:

- **Drag & Drop**: @dnd-kit

- **Maps**: Mapbox GL (optional)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Storage**: File-based JSON with per-file mutex- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## 10-Step SetupYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### 1. Clone or extract the project## Deploy on Vercel

````bashThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

cd trip-planning

```Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


### 2. Install dependencies

```bash
bun install
````

### 3. Configure environment (optional)

```bash
cp .env.sample .env
```

Edit `.env` and add optional API keys:

- `NEXT_PUBLIC_MAPBOX_TOKEN`: For map visualization (app works without it)
- `OPENTRIPMAP_API_KEY`: For place search (uses mock data if not provided)

### 4. Seed the database

```bash
bun run seed
```

This creates sample data in the `data/` directory:

- `trips.json`: A Hanoi-Sapa trip with 3 days, activities, and transportation
- `places_cache.json`: Empty cache for place data
- `settings.json`: Default settings

### 5. Run the development server with Turbopack

```bash
bun dev
```

The app will be available at `http://localhost:3000`

### 6. Explore the application

- **Home**: `http://localhost:3000` - Landing page
- **Trips List**: `http://localhost:3000/trips` - View all trips
- **Trip Editor**: Click on any trip to edit details, days, activities, and transportation

### 7. Create your first trip

1. Click "Create New Trip" from the home page
2. Fill in title, destination, dates, and currency
3. Add days to your trip
4. Add activities to each day
5. Add transportation between activities
6. View budget summary with automatic totals

### 8. Build for production

```bash
bun run build
```

### 9. Start production server

```bash
bun start
```

### 10. Deploy with Docker (optional)

```bash
docker-compose up -d
```

Or build and run manually:

```bash
docker build -t trip-planner .
docker run -p 3000:3000 -v $(pwd)/data:/app/data trip-planner
```

## Project Structure

```
trip-planning/
├── data/                      # JSON data files (git-ignored)
│   ├── trips.json            # All trip data with nested days/activities/transports
│   ├── places_cache.json     # Cached place data
│   └── settings.json         # App settings
├── scripts/
│   └── seed.ts               # Database seeding script
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API route handlers
│   │   ├── trips/            # Trip pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── AntdRegistry.tsx  # Ant Design CSS-in-JS setup
│   │   ├── BudgetSummary.tsx # Budget totals display
│   │   └── TransportEditor.tsx # Transport form with calculations
│   └── lib/
│       ├── data/             # Data layer (JSON with mutex)
│       ├── utils/            # Utilities (distance, format, i18n)
│       └── schemas.ts        # Zod schemas & TypeScript types
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Transportation Calculations

The app includes offline estimators that don't require external APIs:

- **Distance**: Calculated using Haversine formula when place coordinates are available
- **Duration**: Estimated based on transport mode with default speeds:
  - Walk: 4 km/h
  - Bike: 15 km/h
  - Car/Taxi: 35 km/h (city)
  - Bus: 25 km/h
  - Train/Metro: 50 km/h
  - Ferry: 25 km/h
  - Flight: 700 km/h + 120 min overhead
- **Times**: Auto-calculate arrive/depart times based on adjacent activities

## Scripts

```bash
# Development with Turbopack
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code
bun lint

# Type check
bun typecheck

# Seed database
bun seed

# Run tests
bun test
```

## Notes

- **No authentication**: This is a personal-only app meant for local use
- **No collaboration**: Single-user only
- **No external database**: All data in JSON files
- **Optional features**: Map and place search work without API keys (use mock data)
- **Backup**: Simply copy the `data/` folder to backup all your trips
- **Git**: The `data/` folder is git-ignored except for `.gitkeep`

---

**Happy trip planning! 🌍✈️**
