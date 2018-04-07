"use strict";
const path = require("path");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "../src"),
  output: {
    filename: "sulcalc.js",
    path: path.join(__dirname, "../dist/sulcalc"),
    library: "sulcalc",
    libraryTarget: "umd"
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        type: "javascript/esm",
        loader: "babel-loader",
        exclude: /(node_modules|dist)\//,
        options: { envName: "webpack" }
      }
    ]
  },
  mode: "production",
  devtool: "cheap-module-source-map",
  optimization: {
    minimizer: [new BabelMinifyPlugin()]
  }
};
