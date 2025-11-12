import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  vehicle_info?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimated_cost?: number;

  @IsOptional()
  @IsString()
  notes?: string; // ✅ 新增字段
}
