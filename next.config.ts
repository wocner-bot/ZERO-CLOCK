import type {NextConfig} from 'next';

const nodeRuntime = process.env.APP_RUNTIME === 'node';
const nextConfig: NextConfig = nodeRuntime ? {
  distDir: '.next-render',
  poweredByHeader: false,
  typescript: {tsconfigPath: 'tsconfig.render.json'},
} : {};

export default nextConfig;
