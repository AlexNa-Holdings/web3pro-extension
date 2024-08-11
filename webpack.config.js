const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    mode: "production",
    entry: "./src/inject.js",
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: { keep_classnames: true, keep_fnames: true },
        }),
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "inject.js",
    },
    performance: {
      hints: false,
    },
  },
  {
    mode: "production",
    entry: "./src/bg.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bg.js",
    },
    performance: {
      hints: false,
    },
  }
];
