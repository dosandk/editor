const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    previewWorkerManager: path.join(__dirname, '../preview/client/index.js'),
    testEnvironment: path.join(__dirname, '../preview/client/lib/runners/testEnvironment.js')
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    path: path.join(__dirname, '../dist'),
    chunkFilename: '[name]-[id].js'
  },
  devServer: {
    // writeToDisk: true,
    hot: true,
    compress: true,
    publicPath: '/',
    contentBase: path.join(__dirname, '../dist'),
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../preview/index.html')
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../preview/client/serviceWorker.js')
      },
    ])
  ]
});
