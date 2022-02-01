import fs from 'fs';
import util from 'util';

export const readFile = util.promisify(fs.readFile);
export const readDir = util.promisify(fs.readdir);
export const writeFile = util.promisify(fs.writeFile);
export const mkdir = util.promisify(fs.mkdir);
export const exists = util.promisify(fs.exists);
