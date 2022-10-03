#!/usr/bin/env node
process._startTime = Date.now();
import('../dist/cli.mjs').catch(console.error);
