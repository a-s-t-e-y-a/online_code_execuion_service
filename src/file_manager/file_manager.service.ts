import { BadRequestException, Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

interface CreateFileNameParams {
  extension: string;
}
interface CreateGeneratedFileParams {
  generated_code: string;
  path: string;
  extension: string;
}
@Injectable()
export class FileManagerService {
  async createFileName({ extension }: CreateFileNameParams) {
    const uniquePart = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return `${uniquePart}.${extension}`;
  }

  async checkIfDirectoryExists(directoryPath: string) {
    return fs.existsSync(directoryPath);
  }

  async createGeneratedFile({
    generated_code,
    path,
    extension,
  }: CreateGeneratedFileParams) {
    const directoryExist = this.checkIfDirectoryExists(path);
    if (!directoryExist) {
      throw new BadRequestException('Directory does not exist, Backend issue');
    }
    const fileName = await this.createFileName({ extension });
    fs.writeFile(`${path}/${fileName}`, generated_code, (err) => {
      if (err) {
        throw new BadRequestException('Error creating file');
      }
      console.log('File written successfully');
    });
    return {
      fileName,
      fullPath: `${path}/${fileName}`,
    };
  }
}
