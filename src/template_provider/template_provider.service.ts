import { Injectable } from '@nestjs/common';
import { CreateTemplateProviderDto } from './dto/create-template_provider.dto';
import { UpdateTemplateProviderDto } from './dto/update-template_provider.dto';

@Injectable()
export class TemplateProviderService {
  create(createTemplateProviderDto: CreateTemplateProviderDto) {
    return 'This action adds a new templateProvider';
  }

  findAll() {
    return `This action returns all templateProvider`;
  }

  findOne(id: number) {
    return `This action returns a #${id} templateProvider`;
  }

  update(id: number, updateTemplateProviderDto: UpdateTemplateProviderDto) {
    return `This action updates a #${id} templateProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} templateProvider`;
  }
}
