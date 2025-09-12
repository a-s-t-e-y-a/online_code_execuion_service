import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProblemResponseDto } from './dto/problem-response.dto';
import { FileUploadInterceptor } from 'src/buckets/file.upload.interceptor';
import { FileRemovalInterceptor } from 'src/buckets/file.removal.interceptor';
import { BucketService } from 'src/buckets/buckets.service';
import { responseInterface } from 'src/database/return.interface';
import { BucketUploads, BucketUploadsType } from 'src/buckets/decorators/bucket-upload.decorator';
import { param } from 'drizzle-orm';


@Controller('problem')
@ApiTags('Contracts')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'public_test_cases', maxCount: 10 },
      { name: 'private_test_cases', maxCount: 10 },
    ]),
    new FileUploadInterceptor(new BucketService()),
    new FileRemovalInterceptor(new BucketService()),
  )
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: ProblemResponseDto })
  async create(
    @Body() createProblemDto: CreateProblemDto,
    @BucketUploads() uploads?: { public_test_cases?: BucketUploadsType[], private_test_cases?: BucketUploadsType[] }
  ): Promise<responseInterface> {
    console.log(uploads)
    const data = await this.problemService.create({ createProblemDto, uploads });
    return {
      message: 'Problem created successfully',
      success: true,
      data,
    }
  }

  @Get()
  @ApiResponse({ status: 200, type: [ProblemResponseDto] })
  async findAll() : Promise<responseInterface> {
    return {
      message : "Success",
      success: true,
      data: await this.problemService.findAll()
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) : Promise<responseInterface> {
    return {
      message: "Success",
      success: true,
      data: await this.problemService.findOne(+id)
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProblemDto: UpdateProblemDto) :Promise<responseInterface> {
    return {
      message: "Success",
      success: true,
      data: await this.problemService.update(+id, updateProblemDto)
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) : Promise<responseInterface> {
    return {
      message: "Success",
      success: true,
      data: await this.problemService.remove(+id)
    };
  }
}
