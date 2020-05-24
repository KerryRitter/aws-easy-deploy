import { Injectable } from '@nestjs/common';
import * as archiver from 'archiver';
import * as rimraf from 'rimraf';
import { createWriteStream, renameSync, existsSync } from 'fs';

@Injectable()
export class FileSystemService {
  get cwd() {
    return process.cwd();
  }

  getCwdPath(path?: string) {
    return [this.cwd, path].join('\\');
  }

  delete(path: string) {
    return new Promise((res, rej) => rimraf(path, (e) => (e ? rej(e) : res())));
  }

  rename(sourceFolder: string, destinationFolder: string) {
    return renameSync(sourceFolder, destinationFolder);
  }

  exists(sourceFolder: string) {
    return existsSync(sourceFolder);
  }

  zipFolder(sourceFolder: string, destinationZip: string) {
    const output = createWriteStream(destinationZip);
    const archive = archiver('zip');

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(sourceFolder, false);
      archive.finalize();
    });
  }
}
