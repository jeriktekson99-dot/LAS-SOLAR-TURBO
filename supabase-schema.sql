-- SQL Schema for Las Solar Set-up
-- Copy and Run this in your Supabase SQL Editor

-- 1. Database Fix/Migration (Ensures your existing table is updated)
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      client_name TEXT NOT NULL,
      location TEXT,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      system_size TEXT,
      panel_specs TEXT,
      inverter_type TEXT,
      estimated_savings TEXT,
      image_url TEXT,
      thumbnails TEXT[] DEFAULT '{}',
      overview_content TEXT,
      technical_content TEXT,
      personnel JSONB DEFAULT '{
        "engineer": {"name": "Engr. Carlos Reyes", "title": "Project Lead | Solar Engineering", "avatar": "https://i.pravatar.cc/150?img=11"},
        "installer": {"name": "Mark Dizon", "title": "Lead Installer | System Expertise", "avatar": "https://i.pravatar.cc/150?img=12"}
      }',
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- If it exists, check for the rename or addition
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_personnel') THEN
      ALTER TABLE projects RENAME COLUMN project_personnel TO personnel;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='personnel') THEN
      ALTER TABLE projects ADD COLUMN personnel JSONB DEFAULT '{
        "engineer": {"name": "Engr. Carlos Reyes", "title": "Project Lead | Solar Engineering", "avatar": "https://i.pravatar.cc/150?img=11"},
        "installer": {"name": "Mark Dizon", "title": "Lead Installer | System Expertise", "avatar": "https://i.pravatar.cc/150?img=12"}
      }';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='technical_content') THEN
      ALTER TABLE projects ADD COLUMN technical_content TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
      ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'Completed';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='is_deleted') THEN
      ALTER TABLE projects ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END $$;

-- 2. Create Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT,
  read_time TEXT,
  views INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Leads Table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    CREATE TABLE leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      property_type TEXT,
      utility_provider TEXT,
      monthly_bill TEXT,
      roof_type TEXT,
      shading TEXT,
      goal TEXT,
      timeline TEXT,
      bill_url TEXT,
      status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Archived')),
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Fix column names if they exist from old schema
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='full_name') THEN
      ALTER TABLE leads RENAME COLUMN full_name TO name;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='bill_file_path') THEN
      ALTER TABLE leads RENAME COLUMN bill_file_path TO bill_url;
    END IF;

    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='address') THEN
      ALTER TABLE leads ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='property_type') THEN
      ALTER TABLE leads ADD COLUMN property_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='utility_provider') THEN
      ALTER TABLE leads ADD COLUMN utility_provider TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='monthly_bill') THEN
      ALTER TABLE leads ADD COLUMN monthly_bill TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='roof_type') THEN
      ALTER TABLE leads ADD COLUMN roof_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='shading') THEN
      ALTER TABLE leads ADD COLUMN shading TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='goal') THEN
      ALTER TABLE leads ADD COLUMN goal TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='timeline') THEN
      ALTER TABLE leads ADD COLUMN timeline TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='bill_url') THEN
      ALTER TABLE leads ADD COLUMN bill_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='status') THEN
      ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'New';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='is_deleted') THEN
      ALTER TABLE leads ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END $$;

-- 4. Create Subscribers Table with Safe Migration
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscribers') THEN
    CREATE TABLE subscribers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      source TEXT,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscribers' AND column_name='source') THEN
      ALTER TABLE subscribers ADD COLUMN source TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscribers' AND column_name='is_deleted') THEN
      ALTER TABLE subscribers ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END $$;

-- 5. Create Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  location TEXT,
  rating INTEGER DEFAULT 5,
  content TEXT,
  avatar_url TEXT,
  project_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 7. Policies (DROP and RECREATE for safety)
DO $$ 
BEGIN
  -- Projects Policies
  DROP POLICY IF EXISTS "Public Read Projects" ON projects;
  CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (NOT is_deleted);
  DROP POLICY IF EXISTS "Admin All Projects" ON projects;
  CREATE POLICY "Admin All Projects" ON projects FOR ALL TO authenticated USING (true);

  -- Blog Policies
  DROP POLICY IF EXISTS "Public Read Blogs" ON blog_posts;
  CREATE POLICY "Public Read Blogs" ON blog_posts FOR SELECT USING (NOT is_deleted);
  DROP POLICY IF EXISTS "Admin All Blogs" ON blog_posts;
  CREATE POLICY "Admin All Blogs" ON blog_posts FOR ALL TO authenticated USING (true);

  -- Leads Policies
  DROP POLICY IF EXISTS "Admin All Leads" ON leads;
  CREATE POLICY "Admin All Leads" ON leads FOR ALL TO authenticated USING (true);
  DROP POLICY IF EXISTS "Admin Select Leads" ON leads;
  CREATE POLICY "Admin Select Leads" ON leads FOR SELECT TO authenticated USING (true);
  
  -- SECURE MODEL FOR LEADS:
  -- 1) Public users can ONLY insert new records (to submit inquiries)
  DROP POLICY IF EXISTS "Public Select Leads" ON leads;
  DROP POLICY IF EXISTS "Public Select Leads Anon" ON leads;
  DROP POLICY IF EXISTS "Public Select Leads Auth" ON leads;
  
  DROP POLICY IF EXISTS "Public Insert Leads" ON leads;
  CREATE POLICY "Public Insert Leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
  DROP POLICY IF EXISTS "Public Insert Leads Anon" ON leads;
  DROP POLICY IF EXISTS "Public Insert Leads Auth" ON leads;

  -- 2) Anonymous update/select is restricted. If the front-end needs to check or update an existing lead, 
  -- it is highly recommended to do so using Supabase Anonymous Auth (matching auth.uid() = user_id) 
  -- or via a secure PostgreSQL RPC function (view instructions in the final report).
  -- For backward compatibility with client-side multi-step wizard, anon can only specify actions on rows they have:
  DROP POLICY IF EXISTS "Public Update Leads" ON leads;
  DROP POLICY IF EXISTS "Public Update Leads Anon" ON leads;
  DROP POLICY IF EXISTS "Public Update Leads Auth" ON leads;
  
  -- Subscribers Policies (🔒 SECURED: Completely closed for public viewing)
  DROP POLICY IF EXISTS "Admin All Subscribers" ON subscribers;
  CREATE POLICY "Admin All Subscribers" ON subscribers FOR ALL TO authenticated USING (true);
  DROP POLICY IF EXISTS "Admin Select Subscribers" ON subscribers;
  CREATE POLICY "Admin Select Subscribers" ON subscribers FOR SELECT TO authenticated USING (true);
  
  -- Public is FORBIDDEN from reading subscriber lists (removes scraping vulnerability)
  DROP POLICY IF EXISTS "Public Select Subscribers" ON subscribers;
  DROP POLICY IF EXISTS "Public Select Subscribers Anon" ON subscribers;
  DROP POLICY IF EXISTS "Public Select Subscribers Auth" ON subscribers;

  DROP POLICY IF EXISTS "Public Insert Subscribers" ON subscribers;
  CREATE POLICY "Public Insert Subscribers" ON subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
  DROP POLICY IF EXISTS "Public Insert Subscribers Anon" ON subscribers;
  DROP POLICY IF EXISTS "Public Insert Subscribers Auth" ON subscribers;

  -- Testimonial Policies
  DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
  CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admin All Testimonials" ON testimonials;
  CREATE POLICY "Admin All Testimonials" ON testimonials FOR ALL TO authenticated USING (true);
END $$;

-- 8. Helper Functions
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;

-- 9. Storage Bucket Automations & Policies
-- Creates the 'assets' storage bucket automatically if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'assets' bucket (allows anonymous and authenticated uploads and reads)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
  CREATE POLICY "Public Upload Assets" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'assets');

  DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
  CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'assets');

  DROP POLICY IF EXISTS "Public Update Assets" ON storage.objects;
  CREATE POLICY "Public Update Assets" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'assets');

  DROP POLICY IF EXISTS "Public Delete Assets" ON storage.objects;
  CREATE POLICY "Public Delete Assets" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'assets');
END $$;
