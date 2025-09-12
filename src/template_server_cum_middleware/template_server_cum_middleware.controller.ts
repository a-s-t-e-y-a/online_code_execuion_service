import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TemplateServerCumMiddlewareService } from './template_server_cum_middleware.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('template-server')
export class TemplateServerCumMiddlewareController {
  constructor(private readonly templateServerCumMiddlewareService: TemplateServerCumMiddlewareService) {}

  @Get(':id/download')
  @ApiOperation({ summary: 'Download boilerplate code for a problem' })
  async downloadTemplate(@Param('id') id: string, @Res() res: Response) {
    try {
      const fileData = await this.templateServerCumMiddlewareService.generateTemplate(+id);
      
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
      res.send(fileData.content);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by giving problem ID' })
  findOne(@Param('id') id: string) {
    return this.templateServerCumMiddlewareService.findOne(+id);
  }
}