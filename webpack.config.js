const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    mode: "production",
    entry: "./src/frame.js",
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: { keep_classnames: true, keep_fnames: true },
        }),
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "frame.js",
    },
    performance: {
      hints: false,
    },
  },
  {
    mode: "production",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
    },
    performance: {
      hints: false,
    },
  },
  {
    mode: "production",
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/*.png", to: "[name][ext]" },
          { from: "src/*.html", to: "[name][ext]" },
          { from: "src/icons/*.png", to: "[name][ext]" },
          { from: "src/manifest.json", to: "[name][ext]" },
          { from: "src/settings.js", to: "[name][ext]" },
        ],
      }),
    ],
  },
];
