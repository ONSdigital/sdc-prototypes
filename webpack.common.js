import * as path from 'path';
import * as fs from 'fs';
import glob from 'glob';
import { NoEmitOnErrorsPlugin, NamedModulesPlugin } from 'webpack';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import globImporter from 'node-sass-glob-importer';
import ImageminPlugin from 'imagemin-webpack-plugin';

import postcssPlugins from './postcss.config';
import svgoConfig from './svgo-config';

const OUT_DIR = 'build';

function formDirectory(startPath, scripts) {
  if (!fs.existsSync(startPath)) {
    return;
  }

  const files = fs.readdirSync(startPath);

  files.forEach(file => {
    const filePath = path.join(startPath, file);
    const statistics = fs.lstatSync(filePath);

    if(statistics.isDirectory()) {
      formDirectory(filePath, scripts);
    } else if (file === 'index.js') {
      const path = startPath.replace('src/', '');
      scripts[`${path}/${file.replace('.js', '')}`] = `./${path}/${file}`;
    }
  });
}

function generateScriptEntries() {
  const scripts = {};

  formDirectory('./src/prototypes', scripts);

  return scripts;
}


export default function(mode) {
  const devMode = mode === 'development';

  return {
    context: `${__dirname}/src`,

    mode,
    
    entry: {
      ...generateScriptEntries(),
      styles: glob.sync('./**/*.scss', { cwd: 'src', ignore: './**/_*.scss' }),
      html: glob.sync('./**/*.{njk,html}', { cwd: 'src', ignore: './**/_*.{njk,html}' })
    },

    output: {
      path: path.join(process.cwd(), OUT_DIR),
      filename: '[name].js',
      chunkFilename: '[name].js'
    },

    resolve: {
      extensions: ['.js', '.njk', '.html', '.scss'],
      modules: ['./node_modules'],
      alias: {
        helpers: path.resolve(__dirname, './src/helpers')
      }
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
                  `${__dirname}/src/prototypes`,
                  `${__dirname}/node_modules/@ons/design-system`
                ],
                layoutPath: 'prototypes',
                defaultLayout: 'page-templates/_template.njk',
                context: {
                  devMode
                }
              }
            }
          ]
        },
        // Styles
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].css'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                indent: 'postcss',
                plugins: postcssPlugins
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                precision: 8,
                includePaths: [path.join(process.cwd(), 'src')],
                importer: globImporter()
              }
            }
          ]
        },
        // Script
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      modules: false,
                      targets: {
                        browsers: ['last 3 versions']
                      }
                    }
                  ]
                ],
                plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime']
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new NoEmitOnErrorsPlugin(),

      new NamedModulesPlugin(),

      new ProgressBarPlugin(),

      new CircularDependencyPlugin({
        exclude: /(\\|\/)node_modules(\\|\/)/,
        failOnError: false
      }),

      new FixStyleOnlyEntriesPlugin({
        extensions: ['scss', 'njk', 'html'],
        silent: true
      }),

      new CopyWebpackPlugin(
        [
          {
            context: '../node_modules/@ons/design-system/',
            from: {
              glob: '**/css/**/*',
              dot: true
            }
          },
          {
            context: '../node_modules/@ons/design-system/',
            from: {
              glob: '**/scripts/**/*',
              dot: true
            }
          },
          {
            context: '../node_modules/@ons/design-system/',
            from: {
              glob: '**/fonts/**/*',
              dot: true
            }
          },
          {
            context: '../node_modules/@ons/design-system/',
            from: {
              glob: '**/img/**/*',
              dot: true
            }
          },
          {
            context: '../node_modules/@ons/design-system/',
            from: {
              glob: '**/favicons/**/*',
              dot: true
            }
          }
        ]
      ),

      new ImageminPlugin({
        test: /\.(svg)$/i,
        svgo: {
          plugins: svgoConfig
        }
      })
    ]
  };
};
