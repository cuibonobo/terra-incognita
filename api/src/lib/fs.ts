import fs from 'fs';
import util from 'util';

export const readFile = util.promisify(fs.readFile);
export const readDir = util.promisify(fs.readdir);
export const writeFile = util.promisify(fs.writeFile);
export const mkdir = util.promisify(fs.mkdir);
export const exists = util.promisify(fs.exists);
export const stat = util.promisify(fs.stat);

export const ensureDir = async (dirName: string): Promise<void> => {
  if (!(await exists(dirName))) {
    await mkdir(dirName)
  }
};
