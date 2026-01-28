import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'json-summary'],
        exclude: [
          'node_modules/',
          'src/app/components/ui/**', // Exclude shadcn/ui components
          '**/*.config.ts',
          '**/*.config.js',
          '**/*.config.mjs',
          '**/dist/**',
          '**/e2e/**',
          '**/__tests__/**',
          '**/__mocks__/**',
          '**/coverage/**',
          '**/src/main.tsx', // Entry point, not testable
          '**/src/app/App.tsx', // Main app routing, tested via E2E
          '**/api/**', // API routes
          '**/functions/**', // Server functions
          '**/utils/supabase/**', // Auto-generated
          '**/src/app/components/figma/**', // Figma components
          '**/src/app/components/JobsList.tsx', // Requires Supabase integration, tested via E2E
          '**/src/app/components/JobDetail.tsx', // Requires Supabase integration, tested via E2E
          '**/src/app/components/JobDetailSkeleton.tsx', // Simple skeleton component
          '**/src/app/components/MobileJobHeader.tsx', // Simple display component
          '**/src/app/components/PassphraseGuard.tsx', // Special auth component
          '**/src/app/components/PayloadModal.tsx', // Simple modal component
          '**/src/app/components/SuccessModal.tsx', // Simple modal component
          '**/src/app/components/SuccessPage.tsx', // Simple page component
          '**/src/app/hooks/**', // Hooks tested via component tests
          '**/src/app/lib/supabase.ts', // Supabase client initialization
          '**/test-job-fields.js', // Test file
        ],
        thresholds: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  })
)
