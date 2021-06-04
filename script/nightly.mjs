import { writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import pkgJson from './package.json.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const date = format(new Date(), 'yyyyMMddHHmm');
  const version = `${pkgJson.version}-nightly.${date}`;
  console.log(version);

  const newPackageJson = {
    ...pkgJson,
    version,
  };

  const pkgJsonPath = resolve(__dirname, '..', 'package.json');

  await writeFile(pkgJsonPath, JSON.stringify(newPackageJson, undefined, 2));
};

export default main();
