import { PartialType } from '@nestjs/swagger';
import { CreateFileManagerDto } from './create-file_manager.dto';

export class UpdateFileManagerDto extends PartialType(CreateFileManagerDto) {}
