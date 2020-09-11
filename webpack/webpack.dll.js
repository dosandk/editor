const path = require("path");
const webpack = require("webpack");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: 'cheap-source-map',
  entry: [
    "lodash.debounce",
    "monaco-editor",
  ],
  output: {
    filename: "vendor.[hash].dll.js", // best use [fullhash] here too
    path: path.join(__dirname, '../dist/'),
    library: "dll"
  },
  module: {
    rules: [
      {
        // | svg - add in case when we need load svg font
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
          }
        ]
      },
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'html', 'css'],
    }),
    new webpack.DllPlugin({
      // Keep the name consistent with output.library
      name: "dll",
      format: true,
      path: path.join(__dirname, '../manifest/vendor-manifest.json'),
    }),
  ]
};
