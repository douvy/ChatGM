// const sass = require("@zeit/next-sass");
// const css = require("@zeit/next-css");
const withTM = require("next-transpile-modules");
const withPlugins = require("next-compose-plugins");
const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
