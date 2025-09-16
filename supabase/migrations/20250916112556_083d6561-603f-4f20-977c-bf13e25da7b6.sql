-- Create automations table with proper UUID IDs
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  category TEXT[] NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  setup_time TEXT,
  complexity TEXT,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  suggested_price NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  margin NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  media JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Create policies for automations (public read access)
CREATE POLICY "Automations are publicly viewable" 
ON public.automations 
FOR SELECT 
USING (true);

-- Insert existing automation data with proper UUIDs
INSERT INTO public.automations (
  title, status, category, platforms, setup_time, complexity, reviews_count, rating, 
  cost, suggested_price, profit, margin, description, features, requirements, media
) VALUES 
(
  'Social Media Content Calendar',
  'Active',
  ARRAY['Social Media Management'],
  ARRAY['Instagram', 'LinkedIn', 'Twitter'],
  '2-3 hours',
  'Medium',
  124,
  4.8,
  150,
  500,
  350,
  70.0,
  'Automatically generate and schedule social media posts across multiple platforms with AI-generated content and optimal timing.',
  ARRAY['AI Content Generation', 'Multi-Platform Scheduling', 'Performance Analytics', 'Hashtag Optimization', 'Automated Engagement'],
  ARRAY['Social media platform API access', 'Content approval workflow setup', 'Brand guidelines documentation', 'Target audience personas'],
  '{"video_demo": "https://example.com/demo.mp4", "screenshots": ["https://example.com/screenshot1.png", "https://example.com/screenshot2.png"]}'::jsonb
),
(
  'Lead Qualification System',
  'Active',
  ARRAY['Lead Generation'],
  ARRAY['CRM', 'Email'],
  '3-4 hours',
  'High',
  89,
  4.9,
  200,
  800,
  600,
  75.0,
  'Intelligent lead scoring and qualification automation that routes qualified prospects directly to your CRM with enriched data.',
  ARRAY['Lead Scoring', 'CRM Integration', 'Email Automation', 'Data Enrichment'],
  ARRAY['CRM API access', 'Lead scoring criteria', 'Email templates'],
  '{"video_demo": "https://example.com/demo2.mp4", "screenshots": ["https://example.com/screenshot3.png"]}'::jsonb
),
(
  'Content Generation Pipeline',
  'Active',
  ARRAY['Content Generation'],
  ARRAY['Blog', 'SEO'],
  '4-5 hours',
  'High',
  156,
  4.7,
  180,
  650,
  470,
  72.3,
  'End-to-end content creation workflow from research to publication, including blog posts, social media, and newsletters.',
  ARRAY['Blog Posts', 'SEO Optimization', 'Newsletter Creation', 'Research Automation'],
  ARRAY['Content management system access', 'SEO tool integration', 'Publishing workflows'],
  '{"video_demo": "https://example.com/demo3.mp4", "screenshots": ["https://example.com/screenshot4.png", "https://example.com/screenshot5.png"]}'::jsonb
),
(
  'Email Marketing Automation',
  'Active',
  ARRAY['Email Marketing'],
  ARRAY['Email'],
  '2-3 hours',
  'Medium',
  78,
  4.6,
  120,
  450,
  330,
  73.3,
  'Complete email marketing automation including segmentation, personalization, and performance optimization.',
  ARRAY['Email Sequences', 'Segmentation', 'A/B Testing', 'Performance Analytics'],
  ARRAY['Email platform API', 'Customer data', 'Email templates'],
  '{"video_demo": "https://example.com/demo4.mp4", "screenshots": ["https://example.com/screenshot6.png"]}'::jsonb
),
(
  'Customer Support Chatbot',
  'Active',
  ARRAY['Customer Support'],
  ARRAY['Chatbot', 'Website'],
  '5-6 hours',
  'High',
  92,
  4.5,
  250,
  900,
  650,
  72.2,
  'AI-powered customer support automation with ticket routing, knowledge base integration, and escalation protocols.',
  ARRAY['Chatbot', 'Ticket Routing', 'Knowledge Base', 'Escalation Protocols'],
  ARRAY['Website integration', 'Knowledge base setup', 'Support workflows'],
  '{"video_demo": "https://example.com/demo5.mp4", "screenshots": ["https://example.com/screenshot7.png", "https://example.com/screenshot8.png"]}'::jsonb
),
(
  'Financial Reporting Dashboard',
  'Active',
  ARRAY['Financial Management'],
  ARRAY['Dashboard', 'Analytics'],
  '6-8 hours',
  'High',
  67,
  4.8,
  300,
  1200,
  900,
  75.0,
  'Automated financial reporting with real-time KPI tracking, expense categorization, and profit analysis.',
  ARRAY['KPI Tracking', 'Expense Management', 'Profit Analysis', 'Real-time Reporting'],
  ARRAY['Accounting software integration', 'Financial data access', 'Dashboard setup'],
  '{"video_demo": "https://example.com/demo6.mp4", "screenshots": ["https://example.com/screenshot9.png"]}'::jsonb
);

-- Update user_automations table to be a simple link table
-- First, clear existing data and drop columns that contain automation data
TRUNCATE public.user_automations;

ALTER TABLE public.user_automations 
DROP COLUMN IF EXISTS automation_title,
DROP COLUMN IF EXISTS automation_description,
DROP COLUMN IF EXISTS automation_category,
DROP COLUMN IF EXISTS automation_tags,
DROP COLUMN IF EXISTS automation_cost,
DROP COLUMN IF EXISTS automation_suggested_price,
DROP COLUMN IF EXISTS automation_profit,
DROP COLUMN IF EXISTS automation_rating,
DROP COLUMN IF EXISTS automation_reviews;

-- Change automation_id to UUID to match automations table
ALTER TABLE public.user_automations 
ALTER COLUMN automation_id TYPE UUID USING automation_id::uuid;

-- Add foreign key constraint to link to automations table
ALTER TABLE public.user_automations 
ADD CONSTRAINT fk_user_automations_automation_id 
FOREIGN KEY (automation_id) REFERENCES public.automations(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates on automations
CREATE TRIGGER update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();