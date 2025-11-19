# Supabase Database Migrations

## Running Migrations

### Manual Migration (Recommended for Production)

1. **Open Supabase Dashboard**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **SQL Editor**

2. **Run the Migration**
   - Open the migration file: `20250119_create_views_and_reactions_tables.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** or press Ctrl+Enter

3. **Verify Tables Created**
   ```sql
   -- Check views table
   SELECT * FROM views;

   -- Check reactions table
   SELECT * FROM reactions;

   -- Verify RLS policies
   SELECT tablename, policyname FROM pg_policies
   WHERE tablename IN ('views', 'reactions');
   ```

4. **Test API Endpoints**
   After running the migration, test that the API routes work:
   ```bash
   # Test view counter
   curl -X POST http://localhost:3000/api/views \
     -H "Content-Type: application/json" \
     -d '{"slug":"test-post"}'

   # Verify data persisted
   curl http://localhost:3000/api/views?slug=test-post

   # Test reactions
   curl -X POST http://localhost:3000/api/reactions \
     -H "Content-Type: application/json" \
     -d '{"slug":"test-post","type":"like"}'

   # Verify reactions persisted
   curl http://localhost:3000/api/reactions?slug=test-post
   ```

## Migration Details

### 20250119_create_views_and_reactions_tables.sql

**Purpose:** Migrate from in-memory storage to persistent Supabase tables

**Tables Created:**
- `public.views` - Blog post view counts
- `public.reactions` - Blog post likes and bookmarks

**Features:**
- Auto-updating timestamps
- Row Level Security (RLS) policies
- Optimized indexes for fast lookups
- Helper functions for atomic operations

**Security:**
- Public read access (anyone can view counts)
- Service role write access (only API can modify)

## Troubleshooting

### Error: "relation already exists"
If you see this error, the tables already exist. You can either:
1. Drop the existing tables and re-run the migration
2. Skip the migration (tables are already set up)

```sql
-- To drop and re-create:
DROP TABLE IF EXISTS views CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
-- Then run the migration again
```

### Error: "permission denied"
Make sure you're using a role with sufficient permissions. The migration should be run as a database owner or superuser.

### Data Not Persisting
1. Check Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_KEY=your-service-key
   ```

2. Verify RLS policies are set correctly:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'views';
   ```

3. Check API route logs for errors

## Rollback

To rollback this migration:

```sql
-- Drop tables
DROP TABLE IF EXISTS views CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS increment_view_count(TEXT);
DROP FUNCTION IF EXISTS toggle_reaction(TEXT, TEXT);
DROP FUNCTION IF EXISTS update_views_updated_at();
DROP FUNCTION IF EXISTS update_reactions_updated_at();
```

Note: This will delete all engagement data permanently.
