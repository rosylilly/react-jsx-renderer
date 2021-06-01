#!/usr/bin/env node

import { build } from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import { rm, stat } from 'fs/promises';
import packageJSON from './package.json.cjs';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isProduction = mode === 'production';
const dependencies = Object.keys(packageJSON.dependencies);
const peerDependencies = Object.keys(packageJSON.peerDependencies);

const size = (path) => stat(path).then((s) => s.size);

const minify = isProduction;
const external = [...dependencies, ...peerDependencies];

/** @type {import('esbuild').BuildOptions} */
const baseOptions = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  sourcemap: true,
  external,
  minify,
};

const compile = async (/** @type string */ outfile, /** @type {import('esbuild').BuildOptions} */ options) => {
  const start = Date.now();
  return build({
    ...baseOptions,
    ...options,
    outfile,
  }).then(async () => {
    const complete = Date.now();
    const time = complete - start;
    const fileSize = await size(outfile);
    console.log(`===> Complete build: ${outfile}`, { fileSize, minify, time });
  });
};

const cjs = async () => {
  return compile('dist/index.cjs', { format: 'cjs' });
};

const esm = async () => {
  return compile('dist/index.mjs', {
    format: 'esm',
    plugins: [isProduction ? dtsPlugin({ outDir: './dist' }) : null].filter(Boolean),
  });
};

const run = async () => {
  await rm('dist', { recursive: true, force: true });
  return Promise.all([cjs(), esm()]);
};

export default run();
