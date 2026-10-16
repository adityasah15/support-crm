import { IsEmail, IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export class CreateTicketDto {
  @ApiProperty({ example: 'Aarav Mehta' })
  @IsNotEmpty()
  @MaxLength(120)
  customer_name!: string;

  @ApiProperty({ example: 'aarav@example.com' })
  @IsEmail()
  @MaxLength(255)
  customer_email!: string;

  @ApiProperty({ example: 'Login OTP not received' })
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @ApiProperty({ example: 'Not receiving OTP on login...' })
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({ example: 'HIGH', enum: PRIORITIES })
  @IsOptional()
  @IsIn([...PRIORITIES])
  priority?: (typeof PRIORITIES)[number];
}
