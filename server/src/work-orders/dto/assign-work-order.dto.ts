import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class WorkerAssignment {
  @ApiProperty({ description: '工人ID' })
  @IsNotEmpty()
  workerId: number;

  @ApiProperty({ description: '工作角色，如：主修/协助' })
  @IsNotEmpty()
  role: string;
}

export class AssignWorkOrderDto {
  @ApiProperty({ type: [WorkerAssignment], description: '工人分配列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerAssignment)
  workers: WorkerAssignment[];
}