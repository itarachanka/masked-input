module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    coverageReporter: {
      dir: 'build/reports/coverage',
      reporters: [
        { type: 'html', subdir: '.' }
      ]
    },
    files: ['test/**/*.js'],
    frameworks: ['jasmine'],
    preprocessors: {
        'test/**/*.js': ['webpack'],
        'src/**/*.js': ['webpack']
    },
    reporters: ['progress', 'coverage'],
    webpack: {
      cache: true,
      devtool: 'inline-source-map',
      module: {
        preLoaders: [
          {
            test: /\.js$/,
            include: /test/,
            loader: 'babel-loader',
            query: {
              cacheDirectory: true
            }
          },
          {
            test: /\.js?$/,
            include: /src/,
            loader: 'babel-istanbul',
            query: {
              cacheDirectory: true
            }
          }
        ],
        loaders: [
          {
            test: /\.js$/,
            include: /src/,
            loader: 'babel-loader',
            query: {
              cacheDirectory: true
            }
          }
        ]
      }
    }
  });
};
