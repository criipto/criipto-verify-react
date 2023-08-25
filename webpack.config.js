const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Shared config between both cjs and esm builds
const sharedConfig = {
  mode: "production",
  devtool: "source-map",
  experiments: {
    outputModule: true,
  },
  externalsPresets: { node: true },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "criipto-verify-react.css",
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(require("./package.json").version),
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
            loader: "css-loader",
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};

// Export both cjs and esm builds
module.exports = [
  {
    ...sharedConfig,
    externals: [nodeExternals({importType: "module"})],
    entry: {
      "criipto-verify-react.esm": {
        import: path.resolve(__dirname, "src/index.ts"),
        library: {
          type: "module",
        },
      },
    },
  },
  {
    ...sharedConfig,
    externals: [nodeExternals({importType: "commonjs"})],
    entry: {
      "criipto-verify-react.cjs": {
        import: path.resolve(__dirname, "src/index.ts"),
        library: {
          type: "commonjs",
        },
      },
    },
  },
];
