//process.traceDeprecation = true;
const ZipFilesPlugin = require('zip-webpack-plugin');
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimizer: [
      new TerserPlugin()
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ZipFilesPlugin({
      path: '..',
      filename: process.env.npm_package_name + '-' + process.env.npm_package_version.replace(/\./g, "-")
  })
]

});
