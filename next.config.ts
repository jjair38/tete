import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: '*.tikwm.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.tiktok.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ttwstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.byteimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
