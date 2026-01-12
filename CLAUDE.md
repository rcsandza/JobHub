# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Job Detail Page prototype - a job board application built with React, TypeScript, Vite, and Supabase. The application displays job listings and detailed job information, allowing users to search for jobs and submit applications. Originally exported from Figma Make (https://www.figma.com/design/y0Ke3Z3av6HGg4ddaKyJr7/Job-Detail-Page-Prototype).

## Development Commands

```bash
# Install dependencies
npm i

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

### Routing Structure

The application uses React Router with two main routes:
- `/` - Jobs list page (JobsList component)
- `/job/*` - Job detail page (JobDetail component) where `*` captures the full job slug (may include slashes)

### Key Components

**Main Application Structure:**
- `src/main.tsx` - Application entry point
- `src/app/App.tsx` - Root component with router configuration and TopBar
- `src/app/components/TopBar.tsx` - Sticky navigation header with logo and site title

**Job Components:**
- `src/app/components/JobsList.tsx` - Paginated jobs list (100 items per page) with search filters for reference number, company, title, and zip code
- `src/app/components/JobDetail.tsx` - Job detail view with sanitized HTML description, metadata, badges, and application form
- `src/app/components/JobDetailSkeleton.tsx` - Loading state skeleton for job details
- `src/app/components/ApplicationForm.tsx` - Collapsible/sticky application form with resume upload and validation
- `src/app/components/PayloadModal.tsx` - Modal displaying the application payload JSON for debugging

**UI Components:**
- `src/app/components/ui/` - Radix UI components library (shadcn/ui style) with Tailwind styling

### Data Layer

**Supabase Integration:**
- `src/app/lib/supabase.ts` - Supabase client configuration
- `utils/supabase/info.tsx` - Auto-generated credentials (DO NOT manually edit)
- Database table: `jobs` with columns including id, slug, title, company, description_html, posted_at, employment_type, target_wage_rate, postal_code, is_active, extra (JSON field), etc.

**Data Fetching Patterns:**
- Jobs are fetched directly using the Supabase JS client
- JobDetail component fetches by slug using `.eq('slug', slug).single()`
- JobsList uses pagination with `.range()` and filters with `.ilike()`

### Styling System

**CSS Architecture:**
- `src/styles/index.css` - Main stylesheet importing fonts, Tailwind, and theme
- `src/styles/theme.css` - CSS custom properties for colors, spacing, typography
- `src/styles/fonts.css` - Plus Jakarta Sans font definitions
- Tailwind CSS 4.x via `@tailwindcss/vite` plugin
- Custom `.prose-custom` class for sanitized HTML job descriptions

**Design Tokens:**
- Colors: CSS variables like `--foreground`, `--background`, `--primary`, `--muted`, `--border`
- Typography: CSS variables like `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`
- Spacing: CSS variables for radius (`--radius-card`, `--radius-input`) and elevation (`--elevation-sm`, `--elevation-lg`)

### Security

- Job descriptions are sanitized with DOMPurify before rendering via `dangerouslySetInnerHTML`
- HTML content is stored in `description_html` column and always sanitized in JobDetail component

### Application Form Behavior

The ApplicationForm component has smart positioning:
- Initially fixed to bottom of viewport with collapsed state
- Auto-expands when user scrolls to bottom of page
- Becomes static (non-floating) when scrolled into its natural position
- Converts resume files to base64 for API submission
- Phone formatting: xxx-xxx-xxxx (10 digits max)
- Zip code: 5 digits only
- Generates payload with structure: `{ data: { applicant: {...}, job: {...}, tlrSid: ... } }`

### Module Resolution

Vite is configured with `@` alias pointing to `./src` directory. Use `@/` for imports instead of relative paths when referencing files in src.

## Important Notes

- Supabase credentials in `utils/supabase/info.tsx` are auto-generated - never manually edit
- The `extra` field in jobs table is JSONB and can contain arbitrary structured data displayed as sections
- Job slugs can contain slashes (captured with `/job/*` route pattern)
- Jobs have optional `is_active` flag - false values show "May No Longer Be Active" badge
- "New" badge appears on jobs posted within last 7 days
- Wage ranges formatted as "$XX - $XX/hr" or "$XX+/hr"
