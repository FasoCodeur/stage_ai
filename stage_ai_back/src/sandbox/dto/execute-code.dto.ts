import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class ExecuteCodeDto {
  @ApiProperty({ enum: ['python', 'javascript', 'java', 'c', 'cpp'], example: 'python' })
  @IsIn(['python', 'javascript', 'java', 'c', 'cpp'])
  language: string;

  @ApiProperty({ example: 'print("Hello World")' })
  @IsString()
  code: string;
}