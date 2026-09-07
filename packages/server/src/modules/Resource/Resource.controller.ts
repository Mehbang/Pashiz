import { Controller, Get, Param } from '@nestjs/common';
import { ResourceService } from './ResourceService';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResourceMetaResponseDto } from './dtos/ResourceMetaResponse.dto';

@Controller('resources')
@ApiTags('resources')
@ApiExtraModels(ResourceMetaResponseDto)
export class ResourceController {
  constructor(private readonly resourcesService: ResourceService) {}

  @Get('/:resourceModel/meta')
  @ApiOperation({ summary: 'Retrieves the resource meta' })
  @ApiParam({
    name: 'resourceModel',
    description: 'The resource model name (e.g., SaleInvoice, Customer, Item)',
    example: 'SaleInvoice',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieves the resource meta',
    schema: {
      $ref: getSchemaPath(ResourceMetaResponseDto),
    },
  })
  async getResourceMeta(
    @Param('resourceModel') resourceModel: string,
  ): Promise<ResourceMetaResponseDto> {
    const resourceMeta = this.resourcesService.getResourceMeta(resourceModel);
    const localized = this.resourcesService.localizeResourceMeta(resourceMeta);

    // Items carry whatever fields their categories invented; every other
    // resource's field list is fully known from its meta.
    if (resourceModel.toLowerCase() !== 'items') {
      return localized as ResourceMetaResponseDto;
    }
    const categoryFields =
      await this.resourcesService.getCategoryFilterFields();

    return {
      ...localized,
      fields: { ...localized.fields, ...categoryFields },
    } as ResourceMetaResponseDto;
  }
}
