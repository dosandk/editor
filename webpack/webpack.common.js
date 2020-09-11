const nib = require('nib');
const rupture = require('rupture');

// const jsLoaders = require('./loaders/js-loaders');
const cssLoaders = require('./loaders/css-loaders');
const fontLoaders = require('./loaders/font-loaders');
const imageLoaders = require('./loaders/image-loaders');

module.exports = {
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: imageLoaders
      },
      {
        // | svg - add in case when we need load svg font
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: fontLoaders
      },
      {
        test: /\.css$/i,
        use: cssLoaders
      },
      // {
      //   test: /\.(js)?$/,
      //   use: jsLoaders,
      //   exclude: [/(node_modules)/]
      // },
      {
        // make t global, so that it will not be defined in the compiled template function
        // and i18n plugin will substitute
        test: /\.pug/,
        use: 'pug-loader',
      },
      {
        test: /\.styl/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'stylus-loader',
            options: {
              linenos: true,
              'resolve url': true,
              use: [
                rupture(),
                nib()
              ],
            },
          },
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.styl'],
    mainFields: ["browser", "main", "module"] // maybe not needed, from eslint webpack
  },
};
