const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = (_, argv) => {
  const isProduction = argv.mode === 'production';

  const config = {
    entry: './src',
    devtool: !isProduction && 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        minify: isProduction && {
          collapseWhitespace: true,
        },
        inlineSource: isProduction && '\.js$',
      }),
      new HtmlWebpackInlineSourcePlugin(),
    ],
    devServer: {
      stats: 'minimal',
      overlay: true,
    }
  };

  return config;
};
