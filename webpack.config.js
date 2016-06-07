const webpack = require('webpack');

module.exports = {
  cache: false,
  debug: false,
  watch: false,
  devtool: 'source-map',
  entry: {
    main: ['./src']
  },
  output: {
    path: './build',
    filename: '[name].min.js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      include: /src/,
      loaders: ['babel-loader']
    }]
  }
};
