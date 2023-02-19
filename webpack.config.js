let path = require("path");
let webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  entry: {
    app: ["./src/index.ts", "./src/index.scss"],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    fallback: {
      "buffer": require.resolve("buffer")
  }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]",
        },
      },
      {
        test: /\.css$/,
        use: ["css-loader", MiniCssExtractPlugin.loader],
      },

      {
        test: /\.s(c|a)ss$/,
        use: [
          process.env.NODE_ENV !== "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
  },
  mode: "development",
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  devtool: "eval-source-map", //devtool: "source-map",
};
module.exports.plugins = (module.exports.plugins || []).concat([
  new HtmlWebpackPlugin({
    template: "./public/index.html",
    inject: true,
    filename: "index.html",
  }),
  new MiniCssExtractPlugin({
    filename: "[name].css",
  }),
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: '"development"',
    },
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.LoaderOptionsPlugin({
    minimize: true,
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
}),
new webpack.ProvidePlugin({
    process: 'process/browser',
}),
]);
