const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (_, argv) => {
  const isProduction = argv.mode === 'production';

  const config = {
    entry: './src',
    devtool: !isProduction && 'source-map',
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        minify: isProduction && {
          collapseWhitespace: true,
        },
        inlineSource: isProduction && '\.(js|css)$',
      }),
      new HtmlWebpackInlineSourcePlugin(),
      new OptimizeCssAssetsPlugin({}),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    devServer: {
      stats: 'minimal',
      overlay: {
        warnings: true,
        errors: true,
      },
      watchContentBase: true,
    }
  };

  return config;
};
