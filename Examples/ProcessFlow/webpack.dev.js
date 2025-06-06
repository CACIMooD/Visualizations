const CopyPlugin = require('copy-webpack-plugin');
const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const fs = require('fs')
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
        ]
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
        }),
        new CopyPlugin({
            patterns: [{
                context: __dirname,
                from: path.join('test', 'visualization01', 'load-test.css'),
                to: path.join('visualization01', 'load-test.css')
            }]
        }),
        new CopyPlugin({
            patterns: [{
                context: __dirname,
                from: path.join('test', 'visualization02', 'load-test.css'),
                to: path.join('visualization02', 'load-test.css')
            }]
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
        hot: false
    }
});

