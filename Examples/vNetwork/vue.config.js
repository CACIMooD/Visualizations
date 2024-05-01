module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  }
}

/*

    "@babel/plugin-transform-class-properties": "~7.14.8",


"dependencies": {
},
"devDependencies": {
  "@babel/core": "~7.2",
  "@babel/plugin-proposal-class-properties": "~7.3",
  "@babel/plugin-proposal-decorators": "~7.3",
  "@babel/plugin-proposal-json-strings": "~7.2",
  "@babel/plugin-syntax-dynamic-import": "~7.2",
  "@babel/plugin-syntax-import-meta": "~7.2",
  "@babel/preset-env": "~7.3",
  "babel-loader": "~8.0",
  "compression-webpack-plugin": "~2.0",
  "cross-env": "~5.2",
  "css-loader": "~0.28",
  "friendly-errors-webpack-plugin": "~1.7",
  "html-webpack-plugin": "~3.2",
  "mini-css-extract-plugin": "~0.5",
  "node-sass": "~4.11",
  "optimize-css-assets-webpack-plugin": "~3.2",
  "sass-loader": "~7.1",
  "uglifyjs-webpack-plugin": "~1.2",
  "vue-loader": "~15.6",
  "vue-style-loader": "~4.1",
  "vue-template-compiler": "~2.6",
  "webpack": "~4.29",
  "webpack-bundle-analyzer": "~3.0",
  "webpack-cli": "~3.2",
  "webpack-dev-server": "~3.1",
  "webpack-hot-middleware": "~2.24",
  "webpack-merge": "~4.2"
}


*/