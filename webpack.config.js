const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const SWPrecachePlugin = require('sw-precache-webpack-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin').default;
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const envify = require('process-envify');
const uglify = require('uglify-es');
const { VueLoaderPlugin } = require('vue-loader');

const env = require('./env');
const pkg = require('./package');

const SOURCE_ROOT = path.join(__dirname, 'src');
const DIST_ROOT = path.join(__dirname, 'public');

module.exports = ({ prod = false } = {}) => ({
  mode: prod ? 'production' : 'development',
  context: SOURCE_ROOT,
  entry: {
    client: './client.js',
  },
  output: {
    path: DIST_ROOT,
    filename: prod ? '[name].[hash].js' : '[name].js',
    chunkFilename: prod ? '[id].[chunkhash].js' : '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preLoaders: {
            i18n: 'yaml-loader',
          },
          loaders: {
            i18n: '@kazupon/vue-i18n-loader',
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.yml$/,
        use: ['json5-loader', 'yaml-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('assets', 'images/[name].[hash].[ext]'),
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('assets', 'medias/[name].[hash].[ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('assets', 'fonts/[name].[hash].[ext]'),
        },
      },
    ].filter(Boolean),
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '~': path.join(SOURCE_ROOT, 'app'),
      '~assets': path.join(SOURCE_ROOT, 'assets'),
    },
  },
  plugins: [
    new HtmlPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      minify: prod && {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: prod ? 'dependency' : 'auto',
      serviceWorkerLoader: prod
        ? `<script>${uglify.minify(fs.readFileSync(path.join(__dirname, './tools/service-worker.prod.js'), 'utf-8')).code}</script>`
        : `<script>${fs.readFileSync(path.join(__dirname, './tools/service-worker.dev.js'), 'utf-8')}</script>`,
    }),
    new CopyPlugin([
      {
        from: 'assets/**/*',
        to: DIST_ROOT,
        ignore: ['assets/styles/**/*'],
      },
    ]),
    new webpack.DefinePlugin(envify(env)),
    new VueLoaderPlugin(),
    !prod && new webpack.HotModuleReplacementPlugin(),
    prod && new SWPrecachePlugin({
      cacheId: pkg.name,
      filename: 'service-worker.js',
      minify: true,
      navigateFallback: 'index.html',
      staticFileGlobs: [`${path.basename(DIST_ROOT)}/*`],
      stripPrefix: `${path.basename(DIST_ROOT)}/`,
    }),
    prod && new RobotstxtPlugin(),
    prod && new SitemapPlugin(env.SITE_URL, [{ path: '/' }]),
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: {
      name: 'manifest',
    },
  },
  devServer: {
    contentBase: DIST_ROOT,
    historyApiFallback: true,
    host: env.HOST_NAME,
    hot: true,
    inline: true,
    port: env.SITE_PORT,
  },
  devtool: prod ? 'hidden-source-map' : 'cheap-module-eval-source-map',
});
