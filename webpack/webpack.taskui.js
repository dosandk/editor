const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = merge(common, {
  devtool: 'cheap-source-map',
  entry: {
    app: path.join(__dirname, '../taskui/index.js'),
    styles: path.join(__dirname, '../taskui/styles/index.styl')
  },
  output: {
    publicPath: '/',
    filename: '[name].bundle.js',
    path: path.join(__dirname, '../dist'),
    chunkFilename: '[name]-[id].js'
  },
  devServer: {
    hot: true,
    // writeToDisk: true,
    compress: true,
    publicPath: '/',
    contentBase: path.join(__dirname, '../dist'),
    historyApiFallback: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require("../manifest/vendor-manifest.json") // eslint-disable-line
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../taskui/index.html'),
    }),
    new AddAssetHtmlPlugin([
      {
        filepath: path.join(__dirname, '../dist/vendor.*.dll.js'),
      },
    ])
  ]
});
