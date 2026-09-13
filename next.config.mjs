/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  // Prisma loads its WASM compiler dynamically; Next's automatic trace misses it.
  // Include generated runtime assets for npm production and pnpm local installs.
  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/.prisma/client/**",
      "./node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**",
    ],
  },
};
export default config;
