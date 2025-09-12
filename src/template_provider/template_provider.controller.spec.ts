import { Test, TestingModule } from '@nestjs/testing';
import { TemplateProviderController } from './template_provider.controller';
import { TemplateProviderService } from './template_provider.service';

describe('TemplateProviderController', () => {
  let controller: TemplateProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateProviderController],
      providers: [TemplateProviderService],
    }).compile();

    controller = module.get<TemplateProviderController>(TemplateProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
