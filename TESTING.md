# JobHub Testing Documentation

## Overview

JobHub now has a comprehensive testing infrastructure with unit tests, component tests, E2E tests, and CI/CD integration.

## Test Coverage

Current coverage metrics:
- **Statements**: 92.43%
- **Branches**: 94.66%
- **Functions**: 90.32%
- **Lines**: 92.43%

All metrics exceed the 70% threshold requirement.

## Testing Stack

### Unit & Component Tests
- **Vitest** - Fast, modern test runner with native ESM support
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom matchers for DOM assertions

### E2E Tests
- **Playwright** - Cross-browser end-to-end testing
- Tests run on Chromium, Firefox, WebKit, and mobile browsers

### Code Coverage
- **@vitest/coverage-v8** - V8-based code coverage

## Running Tests

### Unit & Component Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all
```

### Type Checking

```bash
# Run TypeScript type check
npx tsc --noEmit
```

## Project Structure

```
src/
├── utils/                          # Pure utility functions
│   ├── phoneFormatter.ts           # Phone number formatting
│   ├── zipcodeFormatter.ts         # Zipcode formatting
│   ├── fileUtils.ts                # File conversion utilities
│   ├── wageFormatter.ts            # Wage range formatting
│   ├── shiftTimeFormatter.ts       # Shift time formatting
│   ├── addressFormatter.ts         # Address formatting
│   ├── dateUtils.ts                # Date utilities
│   ├── uuidGenerator.ts            # UUID generation
│   └── index.ts                    # Barrel export
├── __tests__/
│   ├── utils/                      # Unit tests for utilities
│   ├── lib/                        # Tests for library functions
│   └── components/                 # Component tests
├── __mocks__/
│   └── supabase.ts                 # Mock Supabase client
e2e/
├── pages/                          # Page Object Models
│   ├── JobsListPage.ts
│   ├── JobDetailPage.ts
│   └── ApplicationFormPage.ts
├── jobs-list.spec.ts               # Jobs list E2E tests
├── job-detail.spec.ts              # Job detail E2E tests
└── application-form.spec.ts        # Application form E2E tests
```

## Test Files

### Unit Tests (101 tests)

**Utility Tests** (74 tests)
- `phoneFormatter.test.ts` - Phone number formatting (7 tests)
- `zipcodeFormatter.test.ts` - Zipcode formatting (6 tests)
- `fileUtils.test.ts` - File conversion (7 tests)
- `wageFormatter.test.ts` - Wage formatting (10 tests)
- `shiftTimeFormatter.test.ts` - Shift time formatting (17 tests)
- `addressFormatter.test.ts` - Address formatting (11 tests)
- `dateUtils.test.ts` - Date utilities (10 tests)

**Library Tests** (20 tests)
- `visitor.test.ts` - Visitor tracking (11 tests)
- `tracking.test.ts` - Event tracking (9 tests)

**Component Tests** (13 tests)
- `ApplicationForm.test.tsx` - Application form (10 tests)
- `TopBar.test.tsx` - Top navigation bar (3 tests)

### E2E Tests

**Jobs List**
- Load and display jobs list
- Search and filter functionality
- Pagination
- Navigation to job details

**Job Detail**
- Display job information
- Scroll to application form
- Show job description

**Application Form**
- Form field rendering
- Phone number formatting (xxx-xxx-xxxx)
- Zipcode limiting (5 digits)
- Form validation
- Checkbox interactions

## CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline runs on every push and pull request to `main`:

1. **Unit Tests & Coverage**
   - Runs all unit and component tests
   - Generates coverage report
   - Enforces 70% minimum threshold
   - Uploads coverage artifacts

2. **E2E Tests**
   - Installs Playwright browsers
   - Runs E2E tests across all browsers
   - Uploads test reports on failure

3. **TypeScript Type Check**
   - Validates all TypeScript types
   - Ensures type safety

**Pipeline will block PRs if:**
- Any test fails
- Coverage drops below 70%
- TypeScript errors are found

## Configuration Files

### vitest.config.ts
- Extends vite.config.ts
- jsdom environment for DOM testing
- V8 coverage provider
- 70% threshold for all metrics
- Excludes:
  - shadcn/ui components
  - Auto-generated files
  - Simple display components
  - E2E test files

### vitest.setup.ts
- Imports @testing-library/jest-dom
- Mocks window.matchMedia
- Mocks IntersectionObserver
- Mocks localStorage/sessionStorage
- Mocks window.scrollTo

### playwright.config.ts
- Test directory: `e2e/`
- Base URL: http://localhost:5173
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Auto-starts dev server in CI

### tsconfig.json
- TypeScript configuration
- Path mapping for @/* imports
- React JSX support
- Type checking for tests

## Extracted Utilities

All pure utility functions have been extracted from components for better testability:

### Phone Formatter
```typescript
formatPhoneNumber('1234567890') // => '123-456-7890'
```

### Zipcode Formatter
```typescript
formatZipcode('123456789') // => '12345'
```

### File Utils
```typescript
await fileToBase64(file) // => base64 string
getDataUriScheme('resume.pdf') // => 'data:application/pdf;base64'
```

### Wage Formatter
```typescript
formatWage({ minWage: 50000, maxWage: 70000 }) // => '$50,000 - $70,000 per year'
formatWage({ minWage: 15, maxWage: 20 }) // => '$15 - $20 per hour'
```

### Shift Time Formatter
```typescript
formatShiftTimes({ monday: 'Morning', tuesday: 'Morning' })
// => { days: 'Mon - Tue', times: 'Mornings' }
```

### Address Formatter
```typescript
formatAddress({ address: '123 Main St\nNew York, NY 10001' })
// => '123 Main St\nNew York, NY 10001'
```

### Date Utils
```typescript
isNewPosting('2024-01-10') // => true/false (within 7 days)
daysSince('2024-01-10') // => number of days
```

### UUID Generator
```typescript
generateUUID() // => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
```

## Mocking Strategy

### Supabase Mock
The `src/__mocks__/supabase.ts` provides a chainable query builder for testing:

```typescript
import { mockResolvedData, resetSupabaseMock } from '@/__mocks__/supabase';

// Mock successful query
mockResolvedData([{ id: '1', title: 'Job' }], 1);

// Mock error
mockResolvedError({ message: 'Database error' });

// Reset mocks
resetSupabaseMock();
```

## Best Practices

1. **Always run tests before committing**
   ```bash
   npm run test:run && npm run test:e2e
   ```

2. **Check coverage before pushing**
   ```bash
   npm run test:coverage
   ```

3. **Use descriptive test names**
   - Describe what the test does
   - Use "should" statements

4. **Test user interactions, not implementation details**
   - Use @testing-library/user-event
   - Query by accessible labels and roles

5. **Keep tests focused**
   - One concept per test
   - Arrange, Act, Assert pattern

6. **Use Page Object Models for E2E tests**
   - Encapsulate page interactions
   - Make tests more maintainable

## Troubleshooting

### Tests failing locally but passing in CI
- Check Node.js version matches CI (20.x)
- Clear node_modules and reinstall
- Check for environment-specific code

### Coverage not meeting threshold
- Run `npm run test:coverage` to see uncovered lines
- Add tests for uncovered branches
- Consider if uncovered code should be excluded

### E2E tests timing out
- Increase timeout in playwright.config.ts
- Add explicit waits for dynamic content
- Check if dev server is running

### TypeScript errors
- Run `npx tsc --noEmit` for full error list
- Check tsconfig.json settings
- Ensure all type packages are installed

## Adding New Tests

### Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/utils/myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/app/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Hello')).toBeVisible();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
