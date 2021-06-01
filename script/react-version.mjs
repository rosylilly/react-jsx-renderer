import { writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import pkgJson from './package.json.cjs';

const [reactVersion] = process.argv.slice(2);

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const reactVersions = {
    '@types/react': `${reactVersion}`,
    '@types/react-dom': `${reactVersion}`,
    react: `${reactVersion}`,
    'react-dom': `${reactVersion}`,
    'react-test-renderer': `${reactVersion}`,
  };

  const newPackageJson = {
    ...pkgJson,
    devDependencies: {
      ...(pkgJson.devDependencies || {}),
      ...reactVersions,
    },
    resolutions: {
      ...(pkgJson.resolutions || {}),
      ...reactVersions,
    },
  };

  const pkgJsonPath = resolve(__dirname, '..', 'package.json');

  await writeFile(pkgJsonPath, JSON.stringify(newPackageJson, undefined, 2));
};

export default main();
