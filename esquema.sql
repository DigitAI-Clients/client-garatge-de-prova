
\restrict RFTAVZrVv93B9VGcF8q9jFKYz5PdGb0w7Q90uXdR2h5yVdWMpuyCWPvfT0OUk0p


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."audit_status" AS ENUM (
    'processing',
    'completed',
    'failed'
);


ALTER TYPE "public"."audit_status" OWNER TO "postgres";


CREATE TYPE "public"."content_status" AS ENUM (
    'queued',
    'generating',
    'review',
    'published'
);


ALTER TYPE "public"."content_status" OWNER TO "postgres";


CREATE TYPE "public"."post_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."post_status" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'pending',
    'active',
    'maintenance',
    'archived'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."social_platform" AS ENUM (
    'linkedin',
    'facebook',
    'instagram'
);


ALTER TYPE "public"."social_platform" OWNER TO "postgres";


CREATE TYPE "public"."social_status" AS ENUM (
    'draft',
    'approved',
    'scheduled',
    'published',
    'failed'
);


ALTER TYPE "public"."social_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'client',
    'lead',
    'staff'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_stock"("p_product_id" "uuid", "p_quantity" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update public.products
  set stock = stock - p_quantity
  where id = p_product_id
  and stock >= p_quantity; -- Evita estoc negatiu
end;
$$;


ALTER FUNCTION "public"."decrement_stock"("p_product_id" "uuid", "p_quantity" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_browsers"("date_from" timestamp without time zone) RETURNS TABLE("name" "text", "value" bigint)
    LANGUAGE "sql"
    AS $$
  select 
    coalesce(browser, 'Desconegut') as name,
    count(*) as value
  from analytics_events
  where created_at >= date_from
  group by browser
  order by value desc
  limit 10;
$$;


ALTER FUNCTION "public"."get_analytics_browsers"("date_from" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_countries"("date_from" timestamp without time zone) RETURNS TABLE("name" "text", "value" bigint)
    LANGUAGE "sql"
    AS $$
  select 
    coalesce(country_code, 'Unknown') as name,
    count(*) as value
  from analytics_events
  where created_at >= date_from
  group by country_code
  order by value desc
  limit 10;
$$;


ALTER FUNCTION "public"."get_analytics_countries"("date_from" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_devices"("date_from" timestamp without time zone) RETURNS TABLE("name" "text", "value" bigint)
    LANGUAGE "sql"
    AS $$
  select 
    coalesce(device_type, 'desktop') as name,
    count(*) as value
  from analytics_events
  where created_at >= date_from
  group by device_type
  order by value desc;
$$;


ALTER FUNCTION "public"."get_analytics_devices"("date_from" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_os"("date_from" timestamp without time zone) RETURNS TABLE("name" "text", "value" bigint)
    LANGUAGE "sql"
    AS $$
  select 
    coalesce(os, 'Desconegut') as name,
    count(*) as value
  from analytics_events
  where created_at >= date_from
  group by os
  order by value desc
  limit 10;
$$;


ALTER FUNCTION "public"."get_analytics_os"("date_from" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analytics_referrers"("date_from" timestamp without time zone) RETURNS TABLE("name" "text", "value" bigint)
    LANGUAGE "sql"
    AS $$
  select 
    coalesce(referrer, 'Directe') as name,
    count(*) as value
  from analytics_events
  where created_at >= date_from
  group by referrer
  order by value desc
  limit 10;
$$;


ALTER FUNCTION "public"."get_analytics_referrers"("date_from" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auth_org_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_auth_org_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_org_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_org_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  assigned_role public.user_role;
  target_org_id uuid;
  metadata jsonb;
BEGIN
  -- Recuperem les metadades que envia el teu RegisterForm.tsx
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  -- ----------------------------------------------------------
  -- A. LÒGICA D'ORGANITZACIÓ (Clau pel futur multi-web)
  -- ----------------------------------------------------------
  -- 1. Primer mirem si la web ens ha enviat un ID (això ho fa el .env.local)
  -- 2. Si no (ex: login Google sense params), usem el teu ID per defecte
  target_org_id := coalesce(
    (metadata->>'org_id')::uuid, 
    '2f1e89dd-0b95-4f7b-ab31-14a9916d374f'::uuid -- ⚠️ EL TEU ID PER DEFECTE
  );

  -- Si encara és null (cas impossible amb el fallback, però per seguretat),
  -- podríem llançar un error o deixar-ho passar si la columna ho permet.
  
  -- ----------------------------------------------------------
  -- B. LÒGICA DE ROLS
  -- ----------------------------------------------------------
  IF new.email = 'digitaistudios.developer@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    -- Si ve el rol a les metadades l'usem, si no 'client'
    assigned_role := coalesce((metadata->>'role')::public.user_role, 'client');
  END IF;

  -- ----------------------------------------------------------
  -- C. INSERCIÓ AL PERFIL PÚBLIC
  -- ----------------------------------------------------------
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    organization_id,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    -- Agafem el nom del formulari o usem l'email com a fallback
    coalesce(metadata->>'full_name', new.email),
    metadata->>'avatar_url',
    assigned_role,
    target_org_id, -- Aquí va l'ID calculat al pas A
    now(),
    now()
  )
  -- Si hi ha conflicte (l'usuari ja existeix), no fem res per no trencar el flux
  ON CONFLICT (id, organization_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Loguegem l'error a Supabase però deixem que l'usuari es creï a Auth
    RAISE WARNING 'Error al trigger handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 
    from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_analytics_views"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- 'CONCURRENTLY' permet llegir la vista mentre s'actualitza sense bloquejos
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_top_pages;
END;
$$;


ALTER FUNCTION "public"."refresh_analytics_views"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" bigint NOT NULL,
    "session_id" "text" NOT NULL,
    "event_name" "text" NOT NULL,
    "path" "text",
    "meta" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "country" "text",
    "city" "text",
    "device_type" "text",
    "browser" "text",
    "os" "text",
    "referrer" "text",
    "duration_seconds" integer DEFAULT 0,
    "country_code" "text",
    "region" "text"
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


ALTER TABLE "public"."analytics_events" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."analytics_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."analytics_visitors" (
    "visitor_id" "text" NOT NULL,
    "first_seen_at" timestamp with time zone DEFAULT "now"(),
    "last_seen_at" timestamp with time zone DEFAULT "now"(),
    "device_type" "text",
    "country" "text",
    "referrer" "text"
);


ALTER TABLE "public"."analytics_visitors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocked_dates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blocked_dates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "customer_name" "text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'confirmed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "form_data" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "service" "text" NOT NULL,
    "message" "text" NOT NULL,
    "source" "text" DEFAULT 'landing_contact_form'::"text"
);


ALTER TABLE "public"."contact_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic" "text" NOT NULL,
    "target_keywords" "text"[],
    "prompt_context" "text",
    "status" "public"."content_status" DEFAULT 'queued'::"public"."content_status",
    "generated_mdx" "text",
    "image_prompt" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid" NOT NULL
);


ALTER TABLE "public"."content_queue" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."mv_analytics_top_pages" AS
 SELECT "path",
    "count"(*) AS "visits",
    "count"(DISTINCT "session_id") AS "unique_visitors",
    "max"("created_at") AS "last_visit"
   FROM "public"."analytics_events"
  GROUP BY "path"
  ORDER BY ("count"(*)) DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."mv_analytics_top_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "customer_email" "text" NOT NULL,
    "customer_details" "jsonb",
    "total_amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "payment_method" "text",
    "payment_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "domain" "text",
    "plan" "text" DEFAULT 'basic'::"text",
    "branding_config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_slug" "text" NOT NULL,
    "reaction_type" "text" NOT NULL,
    "visitor_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "cover_image" "text",
    "content_mdx" "text",
    "tags" "text"[],
    "status" "public"."post_status" DEFAULT 'draft'::"public"."post_status",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published" boolean DEFAULT false,
    "organization_id" "uuid" NOT NULL,
    "reviewed" boolean DEFAULT false
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text",
    "stock" integer DEFAULT 0,
    "images" "text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "public"."user_role" DEFAULT 'lead'::"public"."user_role",
    "stripe_customer_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_members" (
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "status" "public"."project_status" DEFAULT 'pending'::"public"."project_status",
    "repository_url" "text",
    "hosting_url" "text",
    "features_enabled" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "branding_config" "jsonb" DEFAULT '{"logoUrl": "", "primaryColor": "#7c3aed"}'::"jsonb",
    "features_config" "jsonb" DEFAULT '{"blog": true, "booking": false, "ecommerce": false}'::"jsonb",
    "github_repo_url" "text",
    "organization_id" "uuid"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer DEFAULT 60,
    "price" numeric(10,2) DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "form_schema" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid",
    "provider" "text" NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text",
    "expires_at" bigint,
    "provider_account_id" "text",
    "provider_page_id" "text",
    "provider_page_name" "text",
    "provider_avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "platform" "public"."social_platform" NOT NULL,
    "content" "text" NOT NULL,
    "media_url" "text",
    "external_id" "text",
    "error_message" "text",
    "scheduled_at" timestamp with time zone,
    "published_at" timestamp with time zone,
    "status" "public"."social_status" DEFAULT 'draft'::"public"."social_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "instructions" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "comment" "text",
    "device_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "expected_result" "text",
    "order_index" integer DEFAULT 0
);


ALTER TABLE "public"."test_tasks" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."users_summary" AS
 SELECT "id",
    "email",
    ("raw_user_meta_data" ->> 'full_name'::"text") AS "full_name",
    ("raw_user_meta_data" ->> 'avatar_url'::"text") AS "avatar_url"
   FROM "auth"."users";


ALTER VIEW "public"."users_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."web_audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "visitor_id" "text",
    "user_id" "uuid",
    "status" "public"."audit_status" DEFAULT 'processing'::"public"."audit_status",
    "seo_score" integer,
    "performance_score" integer,
    "report_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "organization_id" "uuid"
);


ALTER TABLE "public"."web_audits" OWNER TO "postgres";


ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_visitors"
    ADD CONSTRAINT "analytics_visitors_pkey" PRIMARY KEY ("visitor_id");



ALTER TABLE ONLY "public"."blocked_dates"
    ADD CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_leads"
    ADD CONSTRAINT "contact_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_queue"
    ADD CONSTRAINT "content_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_slug_reaction_type_visitor_id_key" UNIQUE ("post_slug", "reaction_type", "visitor_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id", "organization_id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("project_id", "user_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_connections"
    ADD CONSTRAINT "social_connections_organization_id_provider_provider_page_i_key" UNIQUE ("organization_id", "provider", "provider_page_id");



ALTER TABLE ONLY "public"."social_connections"
    ADD CONSTRAINT "social_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_posts"
    ADD CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_assignments"
    ADD CONSTRAINT "test_assignments_campaign_id_user_id_key" UNIQUE ("campaign_id", "user_id");



ALTER TABLE ONLY "public"."test_assignments"
    ADD CONSTRAINT "test_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_campaigns"
    ADD CONSTRAINT "test_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_results"
    ADD CONSTRAINT "test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_results"
    ADD CONSTRAINT "test_results_task_id_user_id_key" UNIQUE ("task_id", "user_id");



ALTER TABLE ONLY "public"."test_tasks"
    ADD CONSTRAINT "test_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."web_audits"
    ADD CONSTRAINT "web_audits_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_analytics_country" ON "public"."analytics_events" USING "btree" ("country");



CREATE INDEX "idx_analytics_device" ON "public"."analytics_events" USING "btree" ("device_type");



CREATE INDEX "idx_analytics_name" ON "public"."analytics_events" USING "btree" ("event_name");



CREATE INDEX "idx_analytics_session" ON "public"."analytics_events" USING "btree" ("session_id");



CREATE INDEX "idx_analytics_time" ON "public"."analytics_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audits_org" ON "public"."web_audits" USING "btree" ("organization_id");



CREATE INDEX "idx_bookings_org" ON "public"."bookings" USING "btree" ("organization_id");



CREATE INDEX "idx_bookings_time" ON "public"."bookings" USING "btree" ("start_time");



CREATE UNIQUE INDEX "idx_mv_top_pages" ON "public"."mv_analytics_top_pages" USING "btree" ("path");



CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_org" ON "public"."posts" USING "btree" ("organization_id");



CREATE INDEX "idx_posts_org_id" ON "public"."posts" USING "btree" ("organization_id");



CREATE INDEX "idx_posts_published_at" ON "public"."posts" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_posts_slug" ON "public"."posts" USING "btree" ("slug");



CREATE INDEX "idx_services_org" ON "public"."services" USING "btree" ("organization_id");



CREATE INDEX "idx_social_connections_org" ON "public"."social_connections" USING "btree" ("organization_id");



CREATE INDEX "idx_web_audits_email" ON "public"."web_audits" USING "btree" ("email");



CREATE INDEX "idx_web_audits_user_id" ON "public"."web_audits" USING "btree" ("user_id");



CREATE INDEX "social_posts_post_id_idx" ON "public"."social_posts" USING "btree" ("post_id");



CREATE INDEX "social_posts_status_idx" ON "public"."social_posts" USING "btree" ("status");



ALTER TABLE ONLY "public"."blocked_dates"
    ADD CONSTRAINT "blocked_dates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."content_queue"
    ADD CONSTRAINT "content_queue_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "fk_project_members_users" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_slug_fkey" FOREIGN KEY ("post_slug") REFERENCES "public"."posts"("slug") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."social_connections"
    ADD CONSTRAINT "social_connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_connections"
    ADD CONSTRAINT "social_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."social_posts"
    ADD CONSTRAINT "social_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_assignments"
    ADD CONSTRAINT "test_assignments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."test_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_assignments"
    ADD CONSTRAINT "test_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_campaigns"
    ADD CONSTRAINT "test_campaigns_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_results"
    ADD CONSTRAINT "test_results_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."test_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_results"
    ADD CONSTRAINT "test_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_tasks"
    ADD CONSTRAINT "test_tasks_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."test_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."web_audits"
    ADD CONSTRAINT "web_audits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."web_audits"
    ADD CONSTRAINT "web_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admin Select Only" ON "public"."analytics_events" FOR SELECT TO "authenticated" USING ((( SELECT ("auth"."jwt"() ->> 'email'::"text")) = 'digitaistudios.developer@gmail.com'::"text"));



CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND ("profiles"."organization_id" = "products"."organization_id")))));



CREATE POLICY "Admins can insert products" ON "public"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND ("profiles"."organization_id" = "products"."organization_id")))));



CREATE POLICY "Admins can manage all projects" ON "public"."projects" USING (("public"."is_admin"() = true));



CREATE POLICY "Admins can manage social posts" ON "public"."social_posts" TO "authenticated" USING (("public"."is_admin"() = true));



CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND ("profiles"."organization_id" = "products"."organization_id")))));



CREATE POLICY "Admins can view all organizations" ON "public"."organizations" USING (("public"."is_admin"() = true));



CREATE POLICY "Admins manage all" ON "public"."test_campaigns" USING ("public"."is_admin"());



CREATE POLICY "Admins manage assignments" ON "public"."test_assignments" USING ("public"."is_admin"());



CREATE POLICY "Admins manage connections" ON "public"."social_connections" USING (("public"."is_admin"() = true));



CREATE POLICY "Admins manage project members" ON "public"."project_members" USING ("public"."is_admin"());



CREATE POLICY "Delete own reaction" ON "public"."post_reactions" FOR DELETE USING ((("visitor_id" = (("current_setting"('request.headers'::"text"))::json ->> 'visitor_id'::"text")) OR true));



CREATE POLICY "Enable delete for authenticated users only" ON "public"."contact_leads" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for everyone" ON "public"."contact_leads" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for visitors" ON "public"."analytics_visitors" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for ADMIN only" ON "public"."contact_leads" FOR SELECT TO "authenticated" USING (("auth"."email"() = 'info@digitaistudios.com'::"text"));



CREATE POLICY "Enable read access for authenticated users only" ON "public"."contact_leads" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read for everyone" ON "public"."analytics_visitors" FOR SELECT USING (true);



CREATE POLICY "Enable select for admins only" ON "public"."analytics_events" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = 'digitaistudios.developer@gmail.com'::"text"));



CREATE POLICY "Manage own results" ON "public"."test_results" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Org members can view colleagues" ON "public"."profiles" FOR SELECT USING (("organization_id" = "public"."get_auth_org_id"()));



CREATE POLICY "Owner Read Policy" ON "public"."web_audits" FOR SELECT TO "authenticated" USING (("email" = ( SELECT ("auth"."jwt"() ->> 'email'::"text"))));



CREATE POLICY "Public Insert Policy" ON "public"."web_audits" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public create booking" ON "public"."bookings" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public create items" ON "public"."order_items" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public create orders" ON "public"."orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert reactions" ON "public"."post_reactions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public read products" ON "public"."products" FOR SELECT USING (("active" = true));



CREATE POLICY "Public read published posts" ON "public"."posts" FOR SELECT USING ((("status" = 'published'::"public"."post_status") AND ("published" = true)));



CREATE POLICY "Public read reactions" ON "public"."post_reactions" FOR SELECT USING (true);



CREATE POLICY "Public read services" ON "public"."services" FOR SELECT USING (true);



CREATE POLICY "RLS: Admins can delete profiles in their organization" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("organization_id" IN ( SELECT "profiles_1"."organization_id"
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "RLS: Enable insert for authenticated users (handled by trigger)" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "RLS: Org admins manage services" ON "public"."services" USING (("organization_id" IN ( SELECT "profiles"."organization_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "RLS: Org admins view bookings" ON "public"."bookings" FOR SELECT USING (("organization_id" IN ( SELECT "profiles"."organization_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Read tasks" ON "public"."test_tasks" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own audits" ON "public"."web_audits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own profile" ON "public"."profiles" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own audits" ON "public"."web_audits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can view their own audits" ON "public"."web_audits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own org posts" ON "public"."posts" TO "authenticated" USING (("organization_id" IN ( SELECT "public"."get_my_org_ids"() AS "get_my_org_ids"))) WITH CHECK (("organization_id" IN ( SELECT "public"."get_my_org_ids"() AS "get_my_org_ids")));



CREATE POLICY "Users read own assignments" ON "public"."test_assignments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own memberships" ON "public"."project_members" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view assigned projects" ON "public"."projects" FOR SELECT USING (("public"."is_admin"() OR ("client_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."project_members"
  WHERE (("project_members"."project_id" = "projects"."id") AND ("project_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users view own project memberships" ON "public"."project_members" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "View own projects" ON "public"."projects" FOR SELECT USING (("client_id" = "auth"."uid"()));



CREATE POLICY "View projects as member" ON "public"."projects" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."project_members"
  WHERE (("project_members"."project_id" = "projects"."id") AND ("project_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Visible to assigned testers" ON "public"."test_campaigns" FOR SELECT USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."test_assignments"
  WHERE (("test_assignments"."campaign_id" = "test_campaigns"."id") AND ("test_assignments"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_visitors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blocked_dates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."web_audits" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_stock"("p_product_id" "uuid", "p_quantity" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_stock"("p_product_id" "uuid", "p_quantity" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_stock"("p_product_id" "uuid", "p_quantity" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_browsers"("date_from" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_browsers"("date_from" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_browsers"("date_from" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_countries"("date_from" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_countries"("date_from" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_countries"("date_from" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_devices"("date_from" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_devices"("date_from" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_devices"("date_from" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_os"("date_from" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_os"("date_from" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_os"("date_from" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_referrers"("date_from" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_referrers"("date_from" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_referrers"("date_from" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auth_org_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_auth_org_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auth_org_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_org_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_org_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_org_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_analytics_views"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_analytics_views"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_analytics_views"() TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_visitors" TO "anon";
GRANT ALL ON TABLE "public"."analytics_visitors" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_visitors" TO "service_role";



GRANT ALL ON TABLE "public"."blocked_dates" TO "anon";
GRANT ALL ON TABLE "public"."blocked_dates" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_dates" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."contact_leads" TO "anon";
GRANT ALL ON TABLE "public"."contact_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_leads" TO "service_role";



GRANT ALL ON TABLE "public"."content_queue" TO "anon";
GRANT ALL ON TABLE "public"."content_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."content_queue" TO "service_role";



GRANT ALL ON TABLE "public"."mv_analytics_top_pages" TO "anon";
GRANT ALL ON TABLE "public"."mv_analytics_top_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."mv_analytics_top_pages" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."post_reactions" TO "anon";
GRANT ALL ON TABLE "public"."post_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."post_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_members" TO "anon";
GRANT ALL ON TABLE "public"."project_members" TO "authenticated";
GRANT ALL ON TABLE "public"."project_members" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."social_connections" TO "anon";
GRANT ALL ON TABLE "public"."social_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."social_connections" TO "service_role";



GRANT ALL ON TABLE "public"."social_posts" TO "anon";
GRANT ALL ON TABLE "public"."social_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."social_posts" TO "service_role";



GRANT ALL ON TABLE "public"."test_assignments" TO "anon";
GRANT ALL ON TABLE "public"."test_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."test_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."test_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."test_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."test_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."test_results" TO "anon";
GRANT ALL ON TABLE "public"."test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."test_results" TO "service_role";



GRANT ALL ON TABLE "public"."test_tasks" TO "anon";
GRANT ALL ON TABLE "public"."test_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."test_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."users_summary" TO "anon";
GRANT ALL ON TABLE "public"."users_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."users_summary" TO "service_role";



GRANT ALL ON TABLE "public"."web_audits" TO "anon";
GRANT ALL ON TABLE "public"."web_audits" TO "authenticated";
GRANT ALL ON TABLE "public"."web_audits" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






\unrestrict RFTAVZrVv93B9VGcF8q9jFKYz5PdGb0w7Q90uXdR2h5yVdWMpuyCWPvfT0OUk0p

RESET ALL;
