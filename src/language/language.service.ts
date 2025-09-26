import { Injectable } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import axios from 'axios';

@Injectable()
export class LanguageService {
  create(createLanguageDto: CreateLanguageDto) {
    return 'This action adds a new language';
  }

  async findAll() {
    const url = process.env.DEV === 'true' ? process.env.PISTON_API_URL_DEV : process.env.PISTON_API_URL;
    const response = await axios.get(url + '/runtimes');
    return response.data;
  }
  
}
