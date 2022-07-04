const path = require('path');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require('fs');

module.exports = {
  mode: 'production',
  devtool: "source-map",
  experiments: {
    outputModule: true
  },
  entry: {
    'criipto-verify-react.esm': {
      import: path.resolve(__dirname, 'src/index.ts'),
      library: {
        type: 'module'
      }
    },
    'criipto-verify-react.cjs': {
      import: path.resolve(__dirname, 'src/index.ts'),
      library: {
        type: 'commonjs'
      }
    }
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'criipto-verify-react.css'
    })
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
            loader: "css-loader",
            options: {
              sourceMap: false
            }
          }
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
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
};