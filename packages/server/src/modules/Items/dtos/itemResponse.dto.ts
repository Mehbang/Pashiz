import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../models/Item';

export class ItemResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the item',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the item',
    example: 'Ergonomic Office Chair Model X-2000',
  })
  name: string;

  @ApiProperty({
    description: 'The type of the item',
    enum: ['service', 'non-inventory', 'inventory'],
    example: 'inventory',
  })
  type: string;

  @ApiProperty({
    description: 'The formatted type of the item',
    example: 'Inventory Item',
  })
  typeFormatted: string;

  @ApiProperty({
    description: 'The item code/SKU',
    example: 'CHAIR-X2000',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Whether the item can be sold',
    example: true,
  })
  sellable: boolean;

  @ApiProperty({
    description: 'Whether the item can be purchased',
    example: true,
  })
  purchasable: boolean;

  @ApiProperty({
    description: 'The selling price of the item',
    example: 399.99,
    required: false,
  })
  sellPrice?: number;

  @ApiProperty({
    description: 'The formatted selling price of the item',
    example: '$399.99',
    required: false,
  })
  sellPriceFormatted?: string;

  @ApiProperty({
    description: 'The cost price of the item',
    example: 299.99,
    required: false,
  })
  costPrice?: number;

  @ApiProperty({
    description: 'The formatted cost price of the item',
    example: '$299.99',
    required: false,
  })
  costPriceFormatted?: string;

  @ApiProperty({
    description: 'The currency code of the item',
    example: 'USD',
  })
  currencyCode: string;

  @ApiProperty({
    description: 'The ID of the cost account',
    example: 1001,
    required: false,
  })
  costAccountId?: number;

  @ApiProperty({
    description: 'The cost account details',
    required: false,
  })
  costAccount?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'The ID of the inventory account',
    example: 3001,
    required: false,
  })
  inventoryAccountId?: number;

  @ApiProperty({
    description: 'The inventory account details',
    required: false,
  })
  inventoryAccount?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'The ID of the sell account',
    example: 2001,
    required: false,
  })
  sellAccountId?: number;

  @ApiProperty({
    description: 'The sell account details',
    required: false,
  })
  sellAccount?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'The ID of the item category',
    example: 5,
    required: false,
  })
  categoryId?: number;

  @ApiProperty({
    description: 'The category details',
    required: false,
  })
  category?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'The description shown on sales documents',
    example:
      'Premium ergonomic office chair with adjustable height and lumbar support',
    required: false,
  })
  sellDescription?: string;

  @ApiProperty({
    description: 'The description shown on purchase documents',
    example: 'Ergonomic office chair - Model X-2000 with standard features',
    required: false,
  })
  purchaseDescription?: string;

  @ApiProperty({
    description: 'The quantity of the item in stock (for inventory items)',
    example: 50,
    required: false,
  })
  quantityOnHand?: number;

  @ApiProperty({
    description: 'The ID of the unit the item is counted in',
    example: 1,
    required: false,
  })
  unitId?: number;

  @ApiProperty({
    description: 'The ID of the second unit the item can also be read in',
    example: 2,
    required: false,
  })
  secondaryUnitId?: number;

  @ApiProperty({
    description: 'How many secondary units make one primary unit',
    example: 1000,
    required: false,
  })
  secondaryUnitFactor?: number;

  @ApiProperty({
    description: 'What is written beside a quantity of this item',
    example: 'kg',
  })
  unitLabel: string;

  @ApiProperty({
    description: "What is written beside a quantity in the item's second unit",
    example: 'g',
  })
  secondaryUnitLabel: string;

  @ApiProperty({
    description: 'The stock on hand, formatted and carrying its unit',
    example: '50 kg',
  })
  quantityOnHandFormatted: string;

  @ApiProperty({
    description:
      'The same stock read in the second unit, or null where the item has none',
    example: 50000,
    required: false,
    nullable: true,
  })
  secondaryQuantityOnHand?: number | null;

  @ApiProperty({
    description:
      'The stock in the second unit, formatted and carrying that unit',
    example: '50,000 g',
  })
  secondaryQuantityOnHandFormatted: string;

  @ApiProperty({
    description: 'Additional notes about the item',
    example:
      'Available in black, gray, and navy colors. 5-year warranty included.',
    required: false,
  })
  note?: string;

  @ApiProperty({
    description: 'Whether the item is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'The ID of the tax rate applied to sales',
    example: 1,
    required: false,
  })
  sellTaxRateId?: number;

  @ApiProperty({
    description: 'The tax rate details for sales',
    required: false,
  })
  sellTaxRate?: {
    id: number;
    name: string;
    rate: number;
  };

  @ApiProperty({
    description: 'The ID of the tax rate applied to purchases',
    example: 1,
    required: false,
  })
  purchaseTaxRateId?: number;

  @ApiProperty({
    description: 'The tax rate details for purchases',
    required: false,
  })
  purchaseTaxRate?: {
    id: number;
    name: string;
    rate: number;
  };

  @ApiProperty({
    description: 'The warehouse quantities for the item',
    type: 'array',
    required: false,
  })
  itemWarehouses?: Array<{
    id: number;
    warehouseId: number;
    quantity: number;
    warehouse: {
      id: number;
      name: string;
    };
  }>;

  @ApiProperty({
    description: 'The date when the item was created',
    example: '2024-03-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the item was last updated',
    example: '2024-03-20T10:00:00Z',
  })
  updatedAt: Date;
}
