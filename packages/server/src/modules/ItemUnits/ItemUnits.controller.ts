import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { ItemUnitsService } from './ItemUnits.service';
import { CreateItemUnitDto, EditItemUnitDto } from './ItemUnits.dto';

@Controller('item-units')
@ApiTags('Item Units')
@ApiCommonHeaders()
export class ItemUnitsController {
  constructor(private readonly itemUnitsService: ItemUnitsService) {}

  @Get()
  @ApiOperation({ summary: "Retrieves the organization's units of measure." })
  @ApiResponse({ status: 200, description: 'The units have been retrieved.' })
  getUnits() {
    return this.itemUnitsService.getUnits();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieves the given unit of measure.' })
  getUnit(@Param('id') id: string) {
    return this.itemUnitsService.getUnit(parseInt(id, 10));
  }

  @Post()
  @ApiOperation({ summary: 'Creates a unit of measure.' })
  createUnit(@Body() unitDto: CreateItemUnitDto) {
    return this.itemUnitsService.createUnit(unitDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edits the given unit of measure.' })
  editUnit(@Param('id') id: string, @Body() unitDto: EditItemUnitDto) {
    return this.itemUnitsService.editUnit(parseInt(id, 10), unitDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletes the given unit of measure.' })
  deleteUnit(@Param('id') id: string) {
    return this.itemUnitsService.deleteUnit(parseInt(id, 10));
  }
}
