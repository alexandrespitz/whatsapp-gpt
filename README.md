# Geospatial CRM/Kanban MVP

## Local Development/Run

1. **Install Node LTS (v18)**  
   ```
   nvm use
   ```

2. **Install dependencies**
   ```
   cd web
   npm install
   ```

3. **Configure environment variables**  
   Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPTILER_API_KEY` (optional, for styled maps)
   - `NEXT_PUBLIC_APP_URL`

4. **Supabase setup**  
   - Provision a new Supabase project (https://app.supabase.com/)
   - Enable PostGIS extension in SQL editor.
   - Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor to create schema, RLS, and functions.
   - (Optional) Run `supabase/seed.sql` to add demo/test data.  
   - Get your project's API URL and anon key from Supabase dashboard.

5. **Start the app**
   ```
   npm run dev
   ```

6. **Sign in via magic link or OAuth**  
   - App will prompt for sign-in. New users are auto-provisioned with default org, pipeline, and entity types.

7. **Deploy**  
   - Deploy `web` to Vercel; point env vars to Supabase prod instance.

## Structure

- **web/** - Next.js 14, TypeScript, Shopify Polaris, MapLibre, Supabase, etc.
- **supabase/** - SQL migrations, seed scripts

## Features

- Multi-tenant orgs, RLS for row isolation
- Entities (with multiple geo-locations: point/line/polygon)
- Table, Grid, Kanban views
- Right-drawer map (MapLibre, MapTiler/OSM)
- Supabase Auth (magic link + OAuth)

## Next Steps

- Enable draw/edit on map
- Entity linking UI
- Polish detail/edit forms