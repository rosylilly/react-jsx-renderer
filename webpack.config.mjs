import { join, resolve } from 'path';
import { merge } from 'webpack-merge';
import externals from 'webpack-node-externals';
import HTMLWebpackPlugin from 'html-webpack-plugin';

const mode = process.env['NODE_ENV'] === 'production' ? 'production' : 'development';
const root = resolve(process.cwd());
const src = join(root, 'src');
const dst = join(root, 'dist');

const jsx = mode === 'production' ? 'react-jsx' : 'react-jsxdev';

/** @type {(withType: boolean) => import('webpack').Configuration} */
const base = (withType) => ({
  mode,
  devtool: 'source-map',
  entry: {
    index: join(src, 'index.ts'),
  },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        type: 'javascript/esm',
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: !withType,
              compilerOptions: {
                jsx,
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.mjsx', '.jsx', '.js'],
  }
});

/** @type {import('webpack').Configuration} */
const cjs = merge(base(true), {
  name: 'cjs',
  target: 'es5',
  output: {
    libraryTarget: 'commonjs',
    path: join(dst, 'cjs'),
  },
  externals: [externals()],
});

/** @type {import('webpack').Configuration} */
const esm = merge(base(false), {
  name: 'esm',
  output: {
    module: true,
    libraryTarget: 'module',
    path: join(dst, 'esm'),
    filename: '[name].mjs',
    environment: {
      module: true,
    },
  },
  externals: [externals()],
  experiments: {
    outputModule: true,
  },
});

/** @type {import('webpack').Configuration} */
const dev = merge(base(false), {
  name: 'dev',
  target: 'web',
  entry: {
    index: join(root, 'example', 'index.tsx'),
  },
  output: {
    libraryTarget: 'umd',
    path: join(dst, 'dev'),
  },
  externals: [],
  plugins: [
    new HTMLWebpackPlugin(),
  ],
  devServer: {
  },
})

/** @type {import('webpack').Configuration[]} */
const config = [dev, cjs, esm];

export default config;
