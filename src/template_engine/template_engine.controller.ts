import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TemplateServerCumMiddlewareService } from './template_engine.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('template-server')
export class TemplateServerCumMiddlewareController {
  constructor(private readonly templateServerCumMiddlewareService: TemplateServerCumMiddlewareService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by giving problem ID' })
  findOne(@Param('id') id: string) {
    return this.templateServerCumMiddlewareService.findOne(+id);
  }
}