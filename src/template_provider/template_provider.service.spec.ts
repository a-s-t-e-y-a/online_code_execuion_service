import { Test, TestingModule } from '@nestjs/testing';
import { TemplateProviderService } from './template_provider.service';

describe('TemplateProviderService', () => {
  let service: TemplateProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateProviderService],
    }).compile();

    service = module.get<TemplateProviderService>(TemplateProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
