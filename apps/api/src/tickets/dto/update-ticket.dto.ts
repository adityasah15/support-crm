import { IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const API_STATUSES = ['Open', 'In Progress', 'Closed'] as const;
export type ApiStatus = (typeof API_STATUSES)[number];

export class UpdateTicketDto {
  @ApiPropertyOptional({ example: 'In Progress', enum: API_STATUSES })
  @IsOptional()
  @IsIn([...API_STATUSES])
  status?: ApiStatus;

  @ApiPropertyOptional({ example: 'Called customer, waiting on gateway.' })
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}
