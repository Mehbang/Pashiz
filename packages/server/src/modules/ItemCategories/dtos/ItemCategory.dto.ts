import { IsOptional, ToNumber } from '@/common/decorators/Validators';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * One extra field the category asks its items to fill in.
 *
 * An `id` marks a field that already exists and is being renamed or reordered;
 * without one it is new. A field the category previously had and that is absent
 * from the list is removed, along with the values items held for it.
 */
export class ItemCategoryFieldDto {
  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: 'The field ID, when it already exists',
  })
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ example: 'نویسنده', description: 'The field label' })
  name: string;
}

class CommandItemCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Category name', description: 'The category name' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Category description',
    description: 'The category description',
  })
  description?: string;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'The cost account ID' })
  costAccountId?: number;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'The sell account ID' })
  sellAccountId?: number;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'The inventory account ID' })
  inventoryAccountId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'FIFO', description: 'The cost method' })
  costMethod?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCategoryFieldDto)
  @IsOptional()
  @ApiProperty({
    type: [ItemCategoryFieldDto],
    description: 'The extra fields items in this category fill in',
    required: false,
  })
  fields?: ItemCategoryFieldDto[];
}

export class CreateItemCategoryDto extends CommandItemCategoryDto {}
export class EditItemCategoryDto extends CommandItemCategoryDto {}
