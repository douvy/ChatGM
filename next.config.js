// const sass = require("@zeit/next-sass");
// const css = require("@zeit/next-css");
const withTM = require("next-transpile-modules");
const withPlugins = require("next-compose-plugins");
const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = removeImports(withPlugins(
  [
    [
      withTM,
      {
        transpileModules: ['react-syntax-highlighter'],
      },
    ],
    // [css],
    // [sass, {
    //   cssModules: true
    // }]
  ],
  nextConfig
));
