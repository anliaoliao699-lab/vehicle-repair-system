import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicle_info: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimated_cost?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  actualCost?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  actual_cost?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  estimatedCompletionTime?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  priority?: number;
}