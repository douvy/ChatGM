// const sass = require("@zeit/next-sass");
// const css = require("@zeit/next-css");
const withTM = require('next-transpile-modules');
const withPlugins = require('next-compose-plugins');
const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/account123/**'
      }
    ]
  },
  distDir: 'dist'
};

// module.exports = removeImports(withPlugins(
//   [
//     [
//       withTM,
//       {
//         transpileModules: ['react-syntax-highlighter'],
//       },
//     ],
//     // [css],
//     // [sass, {
//     //   cssModules: true
//     // }]
//   ],
//   nextConfig
// ));

module.exports = nextConfig;
