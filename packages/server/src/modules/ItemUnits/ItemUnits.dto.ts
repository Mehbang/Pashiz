import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateItemUnitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({ description: 'Unit name', example: 'Kilogram' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  @ApiProperty({
    description: 'Short form written beside a quantity',
    example: 'kg',
    required: false,
  })
  symbol?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Whether the unit may be chosen', default: true })
  active?: boolean;
}

export class EditItemUnitDto extends CreateItemUnitDto {}
