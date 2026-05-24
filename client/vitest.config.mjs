import path from 'node:path';

const vitestConfig = {
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    testTimeout: 20000,
  },
};

export default vitestConfig;
