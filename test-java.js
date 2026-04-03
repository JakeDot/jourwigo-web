import { execSync } from 'child_process';
try {
  console.log(execSync('java -version', { encoding: 'utf8' }));
} catch (e) {
  console.error('Java not found');
}
