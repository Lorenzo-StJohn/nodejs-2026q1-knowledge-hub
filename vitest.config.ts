import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    dir: 'src/__tests__',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.service.ts',
        'src/**/*.dto.ts',
        'src/**/*.interceptor.ts',
        'src/**/*.filter.ts',
        'src/**/*.pipe.ts',
        'src/**/*.guard.ts',
      ],
      exclude: ['src/prisma'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 90,
        branches: 85,
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  oxc: false,
});
