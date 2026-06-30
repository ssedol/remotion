import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isLocalRender = process.argv.includes('--local');
const propsPath =
  process.env.REMOTION_PROPS ??
  (isLocalRender
    ? resolve(projectRoot, 'data', 'news.json')
    : '/shared/news.json');
const outputPath =
  process.env.REMOTION_OUTPUT ??
  (isLocalRender
    ? resolve(projectRoot, '..', 'out', 'game-news.mp4')
    : '/out/game-news.mp4');

if (!existsSync(propsPath)) {
  throw new Error(`News props file not found: ${propsPath}`);
}

const bundledDataPath = resolve(projectRoot, 'data', 'news.json');
mkdirSync(dirname(bundledDataPath), {recursive: true});
copyFileSync(propsPath, bundledDataPath);

mkdirSync(dirname(outputPath), {recursive: true});

const remotionBin = resolve(
  projectRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'remotion.cmd' : 'remotion',
);

if (!existsSync(remotionBin)) {
  throw new Error(
    `Remotion CLI not found: ${remotionBin}. Install dependencies before rendering.`,
  );
}

const result = spawnSync(
  remotionBin,
  [
    'render',
    'src/index.ts',
    'GameNewsShort',
    outputPath,
    `--props=${propsPath}`,
  ],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
