/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: {
    scrollRestoration: true,
    mdxRs: true,
    missingSuspenseWithCSRBailout: false,
  },
  headers: () => [
    {
      source: "/",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store,no-cache,must-revalidate,proxy-revalidate,max-age=0",
        },
      ],
    },
  ],
  swcMinify: true,
  compress: true,
  webpack: (config, { webpack }) => {
    config.resolve.alias.canvas = false;
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      }),
    );
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "assets.dev.atozgames.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "assets.dev.atozgames.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
