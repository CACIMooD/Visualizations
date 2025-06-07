const CopyPlugin = require('copy-webpack-plugin');
const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const fs = require('fs')
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  module: {
    rules: [
    // {
    //   test: /\.html$/,
    //   use: ["html-loader"]
    // },
    {
      test: /\.css$/i,
      //   use: ["style-loader", {
      //     loader: "css-loader",
      //     options: {
      //         modules: {
      //             localIdentName: '[local]'
      //         }
      //     }
      // }],

      use: [
        'vue-style-loader',
        { loader: 'css-loader', options: { sourceMap: true } },
      ]
    },
    {
      test: /\.scss$/,
      use: [
        'vue-style-loader',
        { loader: 'css-loader', options: { sourceMap: true } },
        { loader: 'sass-loader', options: { sourceMap: true } }
      ]
    },
    {
      test: /\.sass$/,
      use: [
        'vue-style-loader',
        { loader: 'css-loader', options: { sourceMap: true } },
        { loader: 'sass-loader', options: { sourceMap: true } }
      ]
    }
    ]
  },
  resolve: {
    alias: {
      //'vue$': 'vue/dist/vue.runtime.js'
      'vue': '@vue/runtime-dom'
    }
  },
  entry: fs.readdirSync(path.join(__dirname, 'test'))
  .filter(d => fs.lstatSync(path.join(__dirname, 'test', d)).isDirectory())
  .reduce(function (prev, current) {
      prev[current] = path.join(__dirname, 'test', current, 'visualization.js')
      return prev;
  }, {}),
  plugins: [
    new HtmlWebpackPlugin({
      template: "./test/template.html"
    })
  ],
  mode: "development",
  optimization: {
    minimize: false
  },
  devServer: {
      allowedHosts: "all",
      port: 8080,
      proxy: [
          {
              context: ["/api"],
              target: "http://localhost:8080",
              changeOrigin: true,
          },
      ],
  },
  devtool: "eval-cheap-module-source-map"
});
