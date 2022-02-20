import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import rimraf from 'rimraf';

export const readFile = util.promisify(fs.readFile);
export const readDir = util.promisify(fs.readdir);
export const writeFile = util.promisify(fs.writeFile);
export const mkdir = util.promisify(fs.mkdir);
export const exists = util.promisify(fs.exists);
export const stat = util.promisify(fs.stat);
export const rm = util.promisify(rimraf);

const mkdtemp = util.promisify(fs.mkdtemp);

export const ensureDir = async (dirName: string): Promise<void> => {
  if (!(await exists(dirName))) {
    await mkdir(dirName)
  }
};

export const mkTempDir = async (prefix: string = 'terra-'): Promise<string> => {
  return mkdtemp(path.join(os.tmpdir(), prefix));
};
