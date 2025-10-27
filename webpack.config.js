const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Shared config between both cjs and esm builds
const createConfig = (bundleName, type) => ({
  mode: 'production',
  devtool: 'source-map',
  experiments: {
    outputModule: true,
  },
  externalsPresets: { node: true },
  externals: [nodeExternals({ importType: type })],
  entry: {
    [bundleName]: {
      import: path.resolve(__dirname, 'src/index.ts'),
      library: {
        type: type,
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'criipto-verify-react.css',
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(require('./package.json').version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
});

// Export both cjs and esm builds
module.exports = [
  createConfig('criipto-verify-react.cjs', 'commonjs'),
  createConfig('criipto-verify-react.esm', 'module'),
];
