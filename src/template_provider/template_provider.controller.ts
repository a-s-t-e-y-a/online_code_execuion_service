import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TemplateProviderService } from './template_provider.service';
import { CreateTemplateProviderDto } from './dto/create-template_provider.dto';
import { UpdateTemplateProviderDto } from './dto/update-template_provider.dto';

@ApiTags('template-provider')
@Controller('template-provider')
export class TemplateProviderController {
  constructor(private readonly templateProviderService: TemplateProviderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template provider' })
  create(@Body() createTemplateProviderDto: CreateTemplateProviderDto) {
    return this.templateProviderService.create(createTemplateProviderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all template providers' })
  findAll() {
    return this.templateProviderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template provider by ID' })
  findOne(@Param('id') id: string) {
    return this.templateProviderService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template provider' })
  update(@Param('id') id: string, @Body() updateTemplateProviderDto: UpdateTemplateProviderDto) {
    return this.templateProviderService.update(+id, updateTemplateProviderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template provider' })
  remove(@Param('id') id: string) {
    return this.templateProviderService.remove(+id);
  }
}
