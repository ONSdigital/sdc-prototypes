import * as path from 'path';
import glob from 'glob';
import { NoEmitOnErrorsPlugin, NamedModulesPlugin } from 'webpack';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';

const OUT_DIR = 'build';

export default function(mode) {
  const devMode = mode === 'development';

  return {
    context: `${__dirname}/src`,
    
    entry: {
      html: glob.sync('./**/*.{njk,html}', { cwd: 'src', ignore: './**/_*.{njk,html}' })
    },

    output: {
      path: path.join(process.cwd(), OUT_DIR),
      filename: '[name].js',
      chunkFilename: '[name].js'
    },

    resolve: {
      extensions: ['.js', '.njk', '.html'],
      modules: ['./node_modules'],
      alias: {}
    },

    resolveLoader: {
      modules: ['./node_modules']
    },

    module: {
      rules: [
        // Templates
        {
          test: /\.(njk|html)$/,
          loaders: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].html'
              }
            },
            {
              loader: path.resolve('./lib/nunjucks-html-loader.js'),
              options: {
                searchPaths: [
                  `${__dirname}/src`,
                  `${__dirname}/node_modules/@ons/design-system`
                ],
                layoutPath: 'views/layouts',
                defaultLayout: 'page-templates/_template.njk',
                context: {
                  devMode
                }
              }
            }
          ]
        },
      ]
    },

    plugins: [
      new NoEmitOnErrorsPlugin(),

      new NamedModulesPlugin(),

      new ProgressBarPlugin(),

      new CircularDependencyPlugin({
        exclude: /(\\|\/)node_modules(\\|\/)/,
        failOnError: false
      })
    ]
  };
};
