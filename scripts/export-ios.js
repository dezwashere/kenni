const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Windows sandbox temp paths can be unreadable to hermesc.exe. Keep Metro's
// temporary JS and Hermes bytecode files under the project workspace instead.
const projectRoot = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(projectRoot, '.expo-hermes-tmp-'));
const outputDir = path.resolve(projectRoot, '.expo', 'ios-export');
const expoCli = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
const command = process.platform === 'win32' ? 'node.exe' : process.execPath;
const args = [expoCli, 'export', '--platform', 'ios', '--output-dir', outputDir, ...process.argv.slice(2)];

try {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, TMP: tempRoot, TEMP: tempRoot, TMPDIR: tempRoot },
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
