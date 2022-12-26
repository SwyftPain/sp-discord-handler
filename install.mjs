import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Determine the location where the package files should be installed
const cwd = process.cwd();
const packageDir = cwd;

// Create the package directory if it does not exist
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir);
}

// Copy the necessary package files to the package directory
const files = ['index.mjs', 'config.mjs', '.env.example'];

for (const file of files) {
  fs.copyFileSync(path.join(__dirname, file), path.join(packageDir, file));
}

// Create the 'commands' directory and copy the command files to it
const commandsDir = path.join(packageDir, 'commands');

if (!fs.existsSync(commandsDir)) {
  fs.mkdirSync(commandsDir);
}

fs.copyFileSync(path.join(__dirname, 'commands', 'example.mjs'), path.join(commandsDir, 'example.mjs'));
fs.copyFileSync(path.join(__dirname, 'commands', 'setprefix.mjs'), path.join(commandsDir, 'setprefix.mjs'));

// Install the dependencies
execSync('npm install', { cwd: packageDir });