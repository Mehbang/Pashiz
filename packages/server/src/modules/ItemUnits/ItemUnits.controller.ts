import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { ItemUnitsService } from './ItemUnits.service';
import { CreateItemUnitDto, EditItemUnitDto } from './ItemUnits.dto';
import { RequirePermission } from '@/modules/Roles/RequirePermission.decorator';
import { PermissionGuard } from '@/modules/Roles/Permission.guard';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { AbilitySubject } from '@/modules/Roles/Roles.types';
import { ItemAction } from '@/interfaces/Item';

@Controller('item-units')
@ApiTags('Item Units')
@ApiCommonHeaders()
// Units of measure are item configuration, gated by the same Item permissions.
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ItemUnitsController {
  constructor(private readonly itemUnitsService: ItemUnitsService) {}

  @Get()
  @RequirePermission(ItemAction.VIEW, AbilitySubject.Item)
  @ApiOperation({ summary: "Retrieves the organization's units of measure." })
  @ApiResponse({ status: 200, description: 'The units have been retrieved.' })
  getUnits() {
    return this.itemUnitsService.getUnits();
  }

  @Get(':id')
  @RequirePermission(ItemAction.VIEW, AbilitySubject.Item)
  @ApiOperation({ summary: 'Retrieves the given unit of measure.' })
  getUnit(@Param('id') id: string) {
    return this.itemUnitsService.getUnit(parseInt(id, 10));
  }

  @Post()
  @RequirePermission(ItemAction.CREATE, AbilitySubject.Item)
  @ApiOperation({ summary: 'Creates a unit of measure.' })
  createUnit(@Body() unitDto: CreateItemUnitDto) {
    return this.itemUnitsService.createUnit(unitDto);
  }

  @Put(':id')
  @RequirePermission(ItemAction.EDIT, AbilitySubject.Item)
  @ApiOperation({ summary: 'Edits the given unit of measure.' })
  editUnit(@Param('id') id: string, @Body() unitDto: EditItemUnitDto) {
    return this.itemUnitsService.editUnit(parseInt(id, 10), unitDto);
  }

  @Delete(':id')
  @RequirePermission(ItemAction.DELETE, AbilitySubject.Item)
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletes the given unit of measure.' })
  deleteUnit(@Param('id') id: string) {
    return this.itemUnitsService.deleteUnit(parseInt(id, 10));
  }
}
