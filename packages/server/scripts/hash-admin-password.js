#!/usr/bin/env node
/**
 * Turns an administrator password into the stored form.
 *
 * Run by `setup.sh` inside the server image, which is the only place with a
 * node binary the installer can rely on. The password arrives on stdin rather
 * than as an argument, so it never appears in the process list or in a shell
 * history:
 *
 *   printf '%s' "$password" | node scripts/hash-admin-password.js
 *
 * Prints `scrypt$N$r$p$salt$hash`. `AdminAuthService.verifyPassword` reads the
 * same shape back.
 */
const { randomBytes, scryptSync } = require('node:crypto');

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  // A trailing newline from `read` is not part of what the operator typed.
  const password = input.replace(/\r?\n$/, '');

  if (!password) {
    process.stderr.write('no password on stdin\n');
    process.exit(1);
  }
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
    maxmem: 256 * N * R,
  });

  process.stdout.write(
    ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join(
      '$',
    ),
  );
});
