#!/usr/bin/env node

const fs = require('fs');

const MAX = 13 * 1024;

fs.stat('game.zip', (err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const bytes = stats.size;
  const percent = (bytes / MAX * 100).toFixed(2);
  console.log(`${bytes} bytes (used ${percent}%)`);
  console.log(`${MAX - bytes} bytes remaining`);

  if (bytes > MAX) {
    console.error('zip file is too big!');
    process.exit(2);
  }
});
