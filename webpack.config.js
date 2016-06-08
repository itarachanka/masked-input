const webpack = require('webpack');
const pkg = require('./package.json');

module.exports = {
  cache: false,
  debug: false,
  watch: false,
  devtool: 'source-map',
  entry: {
    maskedInput: ['./src']
  },
  output: {
    path: './build',
    filename: '[name].min.js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.BannerPlugin([`${pkg.name} - ${pkg.description}`,
                              `@version v${pkg.version}`,
                              `@link ${pkg.homepage}`,
                              `@license ${pkg.license}`].join('\n'))
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      include: /src/,
      loaders: ['babel-loader']
    }]
  }
};
