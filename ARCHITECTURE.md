# JobHub Architecture Documentation

**Last Updated**: 2026-01-28
**Version**: 0.0.1

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture Diagram](#architecture-diagram)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Data Layer](#data-layer)
- [State Management](#state-management)
- [Styling System](#styling-system)
- [Utility Functions](#utility-functions)
- [Testing Infrastructure](#testing-infrastructure)
- [Configuration Files](#configuration-files)
- [Changelog](#changelog)
- [Contribution Guidelines](#contribution-guidelines)

---

## Project Overview

JobHub is a modern job board application that enables users to browse job listings, view detailed job information, and submit applications. The application was originally designed in Figma and exported using Figma Make.

### Purpose
- Browse paginated job listings with search and filter capabilities
- View comprehensive job details with rich HTML descriptions
- Submit job applications with resume uploads
- Track visitor analytics and page views

### Tech Stack
- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12 with CSS custom properties
- **UI Components**: Radix UI primitives (shadcn/ui pattern)
- **Backend**: Supabase (PostgreSQL database and client SDK 2.89.0)
- **Routing**: React Router DOM 7.11.0
- **Form Handling**: React Hook Form 7.55.0
- **HTML Sanitization**: DOMPurify 3.3.1
- **Testing**: Vitest 2.1.0, React Testing Library 16.0.0, Playwright 1.48.0
- **Deployment**: Vercel (with serverless functions)

### Origin
Exported from [Figma Make Design](https://www.figma.com/design/y0Ke3Z3av6HGg4ddaKyJr7/Job-Detail-Page-Prototype)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   React App    │
                    │   (Vite Dev)   │
                    └───────┬────────┘
                            │
        ┏━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━┓
        ┃                                        ┃
┌───────▼────────┐                    ┌─────────▼────────┐
│   Supabase     │                    │  Vercel API      │
│   PostgreSQL   │                    │  (/api/apply)    │
│                │                    │                  │
│  ┌──────────┐  │                    └─────────┬────────┘
│  │jobs table│  │                              │
│  └──────────┘  │                    ┌─────────▼────────┐
└────────────────┘                    │   Homebase API   │
                                      │   (External)     │
                                      └──────────────────┘

Data Flow:
1. User → React App → Supabase (fetch jobs)
2. User → React App → Vercel API → Homebase (submit application)
3. React App → localStorage/sessionStorage (visitor tracking, auth)
```

---

## Directory Structure

```
JobHub/
├── api/                          # Vercel serverless functions
│   └── apply.ts                  # Application submission proxy to Homebase
├── e2e/                          # End-to-end tests (Playwright)
│   ├── pages/                    # Page Object Models
│   │   ├── JobsListPage.ts
│   │   ├── JobDetailPage.ts
│   │   └── ApplicationFormPage.ts
│   ├── jobs-list.spec.ts
│   ├── job-detail.spec.ts
│   └── application-form.spec.ts
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui Radix primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── ... (40+ components)
│   │   │   ├── ApplicationForm.tsx      # Collapsible/sticky form
│   │   │   ├── JobDetail.tsx            # Job detail page
│   │   │   ├── JobDetailSkeleton.tsx    # Loading skeleton
│   │   │   ├── JobsList.tsx             # Paginated jobs list
│   │   │   ├── TopBar.tsx               # Scroll-aware header
│   │   │   ├── MobileJobHeader.tsx      # Mobile job header
│   │   │   ├── PassphraseGuard.tsx      # Auth wrapper
│   │   │   ├── PayloadModal.tsx         # Debug modal
│   │   │   ├── SuccessModal.tsx         # Success modal
│   │   │   ├── SuccessPage.tsx          # Success page
│   │   │   └── figma/
│   │   │       └── ImageWithFallback.tsx
│   │   ├── hooks/
│   │   │   └── usePageTracking.ts       # Analytics hook
│   │   ├── lib/
│   │   │   ├── supabase.ts              # Supabase client
│   │   │   ├── tracking.ts              # Event tracking
│   │   │   └── visitor.ts               # Visitor ID management
│   │   └── App.tsx                      # Root component with routing
│   ├── utils/                           # Pure utility functions
│   │   ├── phoneFormatter.ts            # xxx-xxx-xxxx formatting
│   │   ├── zipcodeFormatter.ts          # 5-digit zipcode
│   │   ├── fileUtils.ts                 # Base64 conversion
│   │   ├── wageFormatter.ts             # Wage range display
│   │   ├── shiftTimeFormatter.ts        # Shift time consolidation
│   │   ├── addressFormatter.ts          # Address formatting
│   │   ├── dateUtils.ts                 # Date calculations
│   │   ├── uuidGenerator.ts             # UUID generation
│   │   └── index.ts                     # Barrel export
│   ├── __tests__/                       # Unit & component tests
│   │   ├── utils/
│   │   ├── lib/
│   │   └── components/
│   ├── __mocks__/                       # Test mocks
│   │   └── supabase.ts                  # Supabase mock
│   ├── styles/
│   │   ├── index.css                    # Main stylesheet
│   │   ├── theme.css                    # CSS custom properties
│   │   └── fonts.css                    # Plus Jakarta Sans
│   └── main.tsx                         # Application entry point
├── utils/
│   └── supabase/
│       └── info.tsx                     # Auto-generated Supabase credentials
├── .github/
│   └── workflows/
│       └── test.yml                     # CI/CD pipeline
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript configuration
├── vitest.config.ts                     # Unit test configuration
├── vitest.setup.ts                      # Test environment setup
├── playwright.config.ts                 # E2E test configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── CLAUDE.md                            # Claude Code instructions
├── TESTING.md                           # Testing documentation
├── ARCHITECTURE.md                      # This file
└── README.md                            # Project README
```

---

## Core Components

### Routing Structure

The application uses React Router DOM with a browser router and three main routes:

**Route Configuration** (`src/app/App.tsx:31-35`)
```typescript
<Routes>
  <Route path="/" element={<JobsList />} />
  <Route path="/job/*" element={<JobDetail />} />
  <Route path="/success" element={<SuccessPage />} />
</Routes>
```

- **`/`** - Jobs list page (JobsList component)
- **`/job/*`** - Job detail page (JobDetail component) where `*` captures the full job slug (may include slashes)
- **`/success`** - Application success page (SuccessPage component)

### Component Hierarchy

```
App
├── PassphraseGuard (conditional wrapper)
├── TopBar (sticky header)
└── Routes
    ├── JobsList
    │   └── Card components (job listings)
    ├── JobDetail
    │   ├── JobDetailSkeleton (loading state)
    │   ├── MobileJobHeader
    │   ├── Job metadata & badges
    │   ├── Sanitized HTML description
    │   └── ApplicationForm
    │       └── PayloadModal (debug)
    └── SuccessPage
```

### Key Components

#### **TopBar** (`src/app/components/TopBar.tsx`)
Scroll-aware sticky navigation header that remains at the top of the viewport.

**Features:**
- Company logo and site title
- Sticky positioning with elevation shadow
- Responsive design

---

#### **JobsList** (`src/app/components/JobsList.tsx`)
Paginated list of job postings with search and filter capabilities.

**Features:**
- Pagination: 100 jobs per page
- Search filters: reference number, company name, job title, zip code
- "New" badge for jobs posted within 7 days
- "May No Longer Be Active" badge for inactive jobs
- Navigation to job detail pages
- Responsive card layout

**Data Fetching Pattern:**
```typescript
const { data: jobs, count } = await supabase
  .from('jobs')
  .select('*', { count: 'exact' })
  .eq('is_active', true)
  .range(start, end)
  .order('posted_at', { ascending: false });
```

---

#### **JobDetail** (`src/app/components/JobDetail.tsx`)
Comprehensive job detail view with application form.

**Features:**
- Fetches job by slug
- Displays job metadata (company, location, wage, employment type)
- Renders sanitized HTML description
- Shows job badges (new, inactive)
- Displays extra fields from JSONB column
- Embedded ApplicationForm component
- Scroll-to-bottom functionality
- Page tracking with `usePageTracking` hook

**Security:**
- All HTML content sanitized with DOMPurify before rendering
- Uses `.prose-custom` class for styled HTML content

**Data Fetching Pattern:**
```typescript
const { data: job } = await supabase
  .from('jobs')
  .select('*')
  .eq('slug', slug)
  .single();
```

---

#### **ApplicationForm** (`src/app/components/ApplicationForm.tsx`)
Smart collapsible/sticky application form with validation and resume upload.

**Behavior:**
- Initially fixed to bottom of viewport (collapsed state)
- Auto-expands when user scrolls to bottom of page
- Becomes static (non-floating) when scrolled into natural position
- Collapse/expand toggle button

**Form Fields:**
- First Name, Last Name (required)
- Email (required, email validation)
- Phone (formatted as xxx-xxx-xxxx, 10 digits max)
- Zip Code (5 digits only)
- Resume Upload (PDF, DOC, DOCX)
- Job Alert Preferences (checkboxes)

**Validation:**
- React Hook Form with custom validators
- Required field validation
- Email format validation
- Phone format validation (10 digits)
- Zip code format validation (5 digits)
- File type validation

**Data Submission:**
- Converts resume to base64 with data URI scheme
- Generates UUID for applicant
- Retrieves visitor ID from localStorage
- Submits to `/api/apply` endpoint
- Stores applied status in sessionStorage
- Redirects to `/success` on submission

**Payload Structure:**
```typescript
{
  data: {
    applicant: {
      firstName: string,
      lastName: string,
      email: string,
      phone: string,
      zipcode: string,
      resume: string,  // base64 with data URI
      jobAlerts: {
        email?: boolean,
        text?: boolean
      },
      sid: string  // UUID
    },
    job: {
      id: string,
      title: string,
      company: string
    },
    tlrSid: string  // Visitor ID
  }
}
```

---

#### **JobDetailSkeleton** (`src/app/components/JobDetailSkeleton.tsx`)
Loading state skeleton that mimics the layout of JobDetail component.

---

#### **PassphraseGuard** (`src/app/components/PassphraseGuard.tsx`)
Optional authentication wrapper that protects the application with a passphrase.

**Features:**
- Stores auth state in localStorage
- Modal dialog for passphrase entry
- Conditional rendering of children

---

#### **UI Components** (`src/app/components/ui/`)
Collection of 40+ Radix UI primitives styled with Tailwind CSS following the shadcn/ui pattern.

**Key Components:**
- `button.tsx` - Button variants
- `input.tsx` - Text input
- `card.tsx` - Card container
- `badge.tsx` - Badge labels
- `dialog.tsx` - Modal dialogs
- `checkbox.tsx` - Checkbox inputs
- `label.tsx` - Form labels
- `skeleton.tsx` - Loading skeletons
- And 30+ more...

**Pattern:**
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS
- Variants managed by `class-variance-authority`
- Utility class merging with `tailwind-merge`

---

## Data Layer

### Supabase Integration

**Client Configuration** (`src/app/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import { getSupabaseURL, getAnonKey } from '@/utils/supabase/info';

export const supabase = createClient(getSupabaseURL(), getAnonKey());
```

**Credentials Location:**
- Auto-generated in `utils/supabase/info.tsx`
- **IMPORTANT**: Never manually edit this file
- Contains `getSupabaseURL()` and `getAnonKey()` functions

---

### Database Schema

**Table: `jobs`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | TEXT | URL-friendly identifier (may contain slashes) |
| `title` | TEXT | Job title |
| `company` | TEXT | Company name |
| `description_html` | TEXT | Rich HTML job description |
| `posted_at` | TIMESTAMPTZ | Job posting date |
| `employment_type` | TEXT | Full-time, Part-time, etc. |
| `target_wage_rate` | NUMERIC | Hourly wage rate |
| `target_wage_min` | NUMERIC | Minimum wage |
| `target_wage_max` | NUMERIC | Maximum wage |
| `postal_code` | TEXT | Job location zip code |
| `is_active` | BOOLEAN | Active status (default: true) |
| `extra` | JSONB | Additional structured data |

**Extra Field Structure:**
The `extra` JSONB column can contain arbitrary sections displayed in the job detail view:
```json
{
  "sections": [
    {
      "title": "Benefits",
      "content": "<ul><li>Health insurance</li></ul>"
    }
  ]
}
```

---

### Data Fetching Patterns

**Pagination:**
```typescript
.range(startIndex, endIndex)
```

**Filtering:**
```typescript
.ilike('column', `%${searchTerm}%`)
```

**Single Fetch:**
```typescript
.eq('slug', slug).single()
```

**Ordering:**
```typescript
.order('posted_at', { ascending: false })
```

**Count:**
```typescript
.select('*', { count: 'exact' })
```

---

### API Endpoints

#### **POST /api/apply** (`api/apply.ts`)
Serverless function that proxies application submissions to Homebase API.

**Purpose:**
- Avoid CORS issues by proxying requests
- Homebase API endpoint: `https://app.joinhomebase.com/hiring/applicants`

**Request:**
- Method: POST
- Body: Application payload (see ApplicationForm section)

**Response:**
- Status: Passes through from Homebase API
- Body: Passes through from Homebase API

---

## State Management

JobHub uses a simple, component-level state management approach with browser storage for persistence.

### Component State (useState)

**Local Component State:**
- Form inputs (ApplicationForm)
- UI toggles (form collapse/expand)
- Loading states
- Search filters (JobsList)
- Pagination state

### sessionStorage

**Applied Status:**
- Key: `applied_${jobId}`
- Value: `'true'`
- Purpose: Track which jobs the user has applied to in current session

### localStorage

**Visitor ID:**
- Key: `visitor_id`
- Value: UUID string
- Purpose: Track unique visitors across sessions
- Managed by `src/app/lib/visitor.ts`

**Authentication:**
- Key: `authenticated`
- Value: `'true'` or `'false'`
- Purpose: PassphraseGuard authentication state

---

## Styling System

### Tailwind CSS 4.x

JobHub uses Tailwind CSS 4 via the `@tailwindcss/vite` plugin with CSS custom properties for theming.

**Configuration:**
- Plugin: `@tailwindcss/vite@4.1.12`
- Main stylesheet: `src/styles/index.css`

**Imports:**
```css
@import './fonts.css';
@import 'tailwindcss';
@import './theme.css';
```

---

### Theme Tokens

**File:** `src/styles/theme.css`

**Color Variables:**
```css
--foreground: ...
--background: ...
--primary: ...
--primary-foreground: ...
--secondary: ...
--muted: ...
--accent: ...
--destructive: ...
--border: ...
--input: ...
--ring: ...
```

**Typography Variables:**
```css
--text-xs: ...
--text-sm: ...
--text-base: ...
--text-lg: ...
--text-xl: ...
--text-2xl: ...
```

**Spacing Variables:**
```css
--radius-card: ...
--radius-input: ...
--radius-button: ...
--elevation-sm: ...
--elevation-lg: ...
```

---

### Custom Styles

**Prose Custom Class:**
Applied to sanitized HTML job descriptions for consistent styling.

```css
.prose-custom {
  /* Typography and spacing for job descriptions */
}
```

**Plus Jakarta Sans Font:**
- Weights: 200-800
- Format: WOFF2
- Defined in `src/styles/fonts.css`

---

## Utility Functions

All utility functions are exported from `src/utils/index.ts` and can be imported as:
```typescript
import { formatPhoneNumber, formatWage } from '@/utils';
```

### Phone Formatter (`src/utils/phoneFormatter.ts`)

**`formatPhoneNumber(value: string): string`**
- Formats phone numbers as xxx-xxx-xxxx
- Strips non-numeric characters
- Limits to 10 digits
- Returns formatted string

**Examples:**
```typescript
formatPhoneNumber('1234567890') // => '123-456-7890'
formatPhoneNumber('123-456-7890') // => '123-456-7890'
formatPhoneNumber('abc123def456') // => '123-456'
```

---

### Zipcode Formatter (`src/utils/zipcodeFormatter.ts`)

**`formatZipcode(value: string): string`**
- Strips non-numeric characters
- Limits to 5 digits
- Returns formatted string

**Examples:**
```typescript
formatZipcode('123456789') // => '12345'
formatZipcode('12345') // => '12345'
formatZipcode('abc12345') // => '12345'
```

---

### File Utils (`src/utils/fileUtils.ts`)

**`fileToBase64(file: File): Promise<string>`**
- Converts File to base64 string
- Returns base64 data without data URI scheme
- Throws error on read failure

**`getDataUriScheme(filename: string): string`**
- Returns data URI scheme based on file extension
- Supports: PDF, DOC, DOCX
- Default: `application/octet-stream`

**Examples:**
```typescript
await fileToBase64(file) // => 'JVBERi0xLjQKJ...'
getDataUriScheme('resume.pdf') // => 'data:application/pdf;base64,'
getDataUriScheme('resume.docx') // => 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,'
```

---

### Wage Formatter (`src/utils/wageFormatter.ts`)

**`formatWage(job: Job): string`**
- Formats wage ranges based on job data
- Handles hourly and annual wages
- Shows single value or range
- Returns formatted string with units

**Examples:**
```typescript
formatWage({ target_wage_rate: 25 }) // => '$25/hr'
formatWage({ target_wage_min: 15, target_wage_max: 20 }) // => '$15 - $20/hr'
formatWage({ target_wage_min: 50000, target_wage_max: 70000 }) // => '$50,000 - $70,000 per year'
formatWage({ target_wage_min: 25 }) // => '$25+/hr'
```

---

### Shift Time Formatter (`src/utils/shiftTimeFormatter.ts`)

**`formatShiftTimes(shifts: Record<string, string>): { days: string, times: string }`**
- Consolidates shift times across days
- Groups consecutive days with same times
- Formats day ranges
- Pluralizes time periods

**Examples:**
```typescript
formatShiftTimes({ monday: 'Morning', tuesday: 'Morning' })
// => { days: 'Mon - Tue', times: 'Mornings' }

formatShiftTimes({ monday: 'Morning', wednesday: 'Evening' })
// => { days: 'Mon, Wed', times: 'Mornings, Evenings' }
```

---

### Address Formatter (`src/utils/addressFormatter.ts`)

**`formatAddress(location: { address?: string, postal_code?: string }): string`**
- Formats address with newlines
- Handles missing fields gracefully
- Returns formatted address string

**Examples:**
```typescript
formatAddress({ address: '123 Main St\nNew York, NY 10001' })
// => '123 Main St\nNew York, NY 10001'

formatAddress({ postal_code: '10001' })
// => '10001'
```

---

### Date Utils (`src/utils/dateUtils.ts`)

**`isNewPosting(postedAt: string): boolean`**
- Checks if posting is within 7 days
- Returns true/false

**`daysSince(postedAt: string): number`**
- Calculates days since posting date
- Returns number of days

**Examples:**
```typescript
isNewPosting('2026-01-25') // => true (within 7 days)
isNewPosting('2026-01-01') // => false (older than 7 days)
daysSince('2026-01-25') // => 3
```

---

### UUID Generator (`src/utils/uuidGenerator.ts`)

**`generateUUID(): string`**
- Generates RFC4122 version 4 UUID
- Uses crypto.randomUUID() when available
- Falls back to custom implementation
- Returns UUID string

**Examples:**
```typescript
generateUUID() // => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
```

---

## Testing Infrastructure

JobHub has comprehensive test coverage with unit tests, component tests, E2E tests, and CI/CD integration.

### Testing Stack

**Unit & Component Tests:**
- **Vitest 2.1.0** - Fast test runner with native ESM support
- **React Testing Library 16.0.0** - Component testing utilities
- **@testing-library/user-event 14.5.2** - User interaction simulation
- **@testing-library/jest-dom 6.5.0** - Custom DOM matchers

**E2E Tests:**
- **Playwright 1.48.0** - Cross-browser end-to-end testing
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

**Code Coverage:**
- **@vitest/coverage-v8 2.1.0** - V8-based coverage
- Threshold: 70% for all metrics (statements, branches, functions, lines)
- Current coverage: 92%+ across all metrics

---

### Test Suite Overview

**Total Tests: 101**

**Unit Tests (74 tests):**
- `phoneFormatter.test.ts` - 7 tests
- `zipcodeFormatter.test.ts` - 6 tests
- `fileUtils.test.ts` - 7 tests
- `wageFormatter.test.ts` - 10 tests
- `shiftTimeFormatter.test.ts` - 17 tests
- `addressFormatter.test.ts` - 11 tests
- `dateUtils.test.ts` - 10 tests
- `uuidGenerator.test.ts` - 6 tests

**Library Tests (20 tests):**
- `visitor.test.ts` - 11 tests (visitor ID management)
- `tracking.test.ts` - 9 tests (event tracking)

**Component Tests (7 tests):**
- `ApplicationForm.test.tsx` - 4 tests
- `TopBar.test.tsx` - 3 tests

**E2E Tests:**
- Jobs list page tests
- Job detail page tests
- Application form interaction tests

---

### Running Tests

```bash
# Unit tests in watch mode
npm test

# Run all unit tests once
npm run test:run

# Coverage report
npm run test:coverage

# Interactive test UI
npm run test:ui

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# All tests (unit + E2E)
npm run test:all

# Type checking
npx tsc --noEmit
```

---

### CI/CD Pipeline

**GitHub Actions Workflow:** `.github/workflows/test.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

1. **Unit Tests & Coverage**
   - Runs all Vitest tests
   - Generates coverage report
   - Enforces 70% threshold
   - Uploads coverage artifacts

2. **E2E Tests**
   - Installs Playwright browsers
   - Runs cross-browser E2E tests
   - Uploads test reports on failure

3. **TypeScript Type Check**
   - Validates all TypeScript types
   - Ensures type safety

**Pipeline blocks PRs if:**
- Any test fails
- Coverage drops below 70%
- TypeScript errors exist

---

### Test Mocking

**Supabase Mock** (`src/__mocks__/supabase.ts`)
Provides chainable query builder for testing Supabase interactions.

```typescript
import { mockResolvedData, mockResolvedError, resetSupabaseMock } from '@/__mocks__/supabase';

// Mock successful query
mockResolvedData([{ id: '1', title: 'Job' }], 1);

// Mock error
mockResolvedError({ message: 'Database error' });

// Reset mocks
resetSupabaseMock();
```

---

## Configuration Files

### `vite.config.ts`

**Purpose:** Vite build tool configuration

**Key Settings:**
- React plugin: `@vitejs/plugin-react`
- Tailwind plugin: `@tailwindcss/vite`
- Path alias: `@` → `./src`
- Port: 5173 (default)

**Alias Configuration:**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

---

### `tsconfig.json`

**Purpose:** TypeScript compiler configuration

**Key Settings:**
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict mode: enabled
- Path mapping: `@/*` → `src/*`

**Includes:**
- `src/**/*`
- Test files

---

### `vitest.config.ts`

**Purpose:** Unit and component test configuration

**Key Settings:**
- Environment: jsdom
- Setup file: `vitest.setup.ts`
- Coverage provider: v8
- Coverage threshold: 70%
- Excludes: shadcn/ui components, auto-generated files, simple display components

**Coverage Exclusions:**
```typescript
exclude: [
  'src/app/components/ui/**',
  'utils/supabase/info.tsx',
  'src/app/components/figma/**',
  // ... more
]
```

---

### `vitest.setup.ts`

**Purpose:** Test environment setup and global mocks

**Mocks:**
- `window.matchMedia` - Media query matching
- `IntersectionObserver` - Intersection observation
- `localStorage` / `sessionStorage` - Browser storage
- `window.scrollTo` - Scroll behavior

---

### `playwright.config.ts`

**Purpose:** End-to-end test configuration

**Key Settings:**
- Test directory: `e2e/`
- Base URL: `http://localhost:5173`
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Auto-starts dev server in CI
- Screenshots on failure
- Test artifacts: `playwright-report/`

---

### `tailwind.config.js`

**Purpose:** Tailwind CSS configuration (if present)

**Note:** JobHub uses Tailwind CSS 4 with the Vite plugin, which may not require a separate config file. Theme customization is done via CSS custom properties in `src/styles/theme.css`.

---

## Changelog

### [2026-01-28] - Documentation
**Summary**: Created comprehensive architecture documentation
- Added ARCHITECTURE.md with complete project overview
- Documented all components, utilities, and configuration
- Included data flow diagrams and directory structure
- Files affected: `ARCHITECTURE.md` (created)

### [2026-01-XX] - Testing Infrastructure
**Summary**: Implemented comprehensive testing suite with 92%+ coverage
- Added 101 unit and component tests using Vitest
- Implemented E2E tests with Playwright (5 browsers)
- Set up GitHub Actions CI/CD pipeline
- Extracted utility functions for testability
- Files affected:
  - `src/__tests__/**/*.test.ts(x)` (created)
  - `e2e/**/*.spec.ts` (created)
  - `vitest.config.ts`, `playwright.config.ts` (created)
  - `.github/workflows/test.yml` (created)
  - `TESTING.md` (created)

### [2026-01-XX] - API Proxy
**Summary**: Added serverless API proxy to fix CORS issues
- Created Vercel serverless function for application submissions
- Proxies requests to Homebase API
- Files affected: `api/apply.ts` (created)

### [2026-01-XX] - Application Form Enhancement
**Summary**: Made job alert checkbox labels dynamic
- Checkbox labels now reflect job details
- Files affected: `src/app/components/ApplicationForm.tsx`

### [2026-01-XX] - UI Fix
**Summary**: Fixed error message layout in application form
- Error messages no longer affect submit button alignment
- Files affected: `src/app/components/ApplicationForm.tsx`

### [2026-01-XX] - Feature Addition
**Summary**: Added shift time display functionality
- Implemented shift time formatter utility
- Displays consolidated shift schedules
- Files affected:
  - `src/utils/shiftTimeFormatter.ts` (created)
  - `src/app/components/JobDetail.tsx`

---

## Contribution Guidelines

### When to Update This Document

Update `ARCHITECTURE.md` whenever you make changes in these categories:

1. **New Features**
   - New components or pages
   - New API endpoints
   - New utility functions

2. **Architecture Changes**
   - Routing modifications
   - State management changes
   - Data flow changes

3. **Dependencies**
   - Major package updates
   - New dependencies added
   - Configuration changes

4. **Data Schema**
   - Database table changes
   - API contract changes
   - Payload structure changes

5. **Testing**
   - New test infrastructure
   - Coverage threshold changes
   - CI/CD pipeline updates

---

### How to Update This Document

1. **Make your code changes first**
2. **Update relevant sections** in `ARCHITECTURE.md`
3. **Add a changelog entry** (see format below)
4. **Update last updated date** at the top
5. **Include in your PR** - Architecture doc updates should be part of the same PR as code changes

---

### Changelog Entry Format

Add new entries to the **top** of the Changelog section:

```markdown
### [YYYY-MM-DD] - Category
**Summary**: Brief one-line description
- Detailed bullet point about change
- Another detail about implementation
- Files affected: `path/to/file.ts`, `path/to/other.tsx`
```

**Categories:**
- **Feature** - New functionality
- **Architecture** - Structural changes
- **Testing** - Test infrastructure changes
- **Config** - Configuration changes
- **Refactor** - Code reorganization without behavior change
- **Fix** - Bug fixes
- **Documentation** - Documentation updates
- **Security** - Security-related changes

---

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code changes are complete and tested
- [ ] Tests pass locally (`npm run test:all`)
- [ ] Coverage meets 70% threshold
- [ ] TypeScript compiles without errors
- [ ] `ARCHITECTURE.md` updated (if applicable)
- [ ] Changelog entry added (if applicable)
- [ ] `CLAUDE.md` updated (if instructions changed)
- [ ] PR description references architecture changes

---

### Questions?

For questions about the architecture or how to contribute, refer to:
- `CLAUDE.md` - Instructions for Claude Code
- `TESTING.md` - Testing infrastructure details
- `README.md` - Getting started guide

---

**Document Maintenance**: This document should be treated as a living document that evolves with the codebase. Keep it accurate, concise, and useful for engineers joining the project.
