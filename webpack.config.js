var path = require('path');
var NodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'event-time-utils.js',
    library: 'event-time-utils',
    libraryTarget: 'umd',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: [
                'env',
                'stage-0',
              ],
              plugins: [
                'transform-decorators-legacy',
              ],
            },
          },
        ],
      }
    ],
  },
  externals: NodeExternals(),
};
