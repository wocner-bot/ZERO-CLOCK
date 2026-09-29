import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const command = process.argv[2];
if (!['build', 'start'].includes(command)) throw new Error('Expected build or start');
const args = command === 'build'
  ? ['build', '--webpack']
  : ['start', '--hostname', '0.0.0.0', '--port', process.env.PORT || '10000'];
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), ...args], {
  stdio: 'inherit',
  env: {...process.env, APP_RUNTIME: 'node', NEXT_TELEMETRY_DISABLED: '1'},
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
