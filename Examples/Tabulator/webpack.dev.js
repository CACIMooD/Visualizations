const path = require('path')
const common = require('./webpack.common')
const { merge } = require('webpack-merge')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(common, {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader']
      }
    ]
  },
  entry: fs
    .readdirSync(path.join(__dirname, 'demo'))
    .filter((d) => fs.lstatSync(path.join(__dirname, 'demo', d)).isDirectory())
    .reduce(function (prev, current) {
      prev[current] = path.join(__dirname, 'demo', current, 'TabulatorDemo.js')
      return prev
    }, {}),
  plugins: [
    new HtmlWebpackPlugin({
      template: './demo/template.html'
    })
  ],
  mode: 'development',
  optimization: {
    minimize: false
  },
  devServer: {
    allowedHosts: 'all',
    port: 8080,
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    ],
  }
})
