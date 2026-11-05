import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { TransactionsByReferenceApplication } from './TransactionsByReferenceApplication';
import { TransactionsByReferenceQueryDto } from './TransactionsByReferenceQuery.dto';
import { TransactionsByReferenceResponseDto } from './TransactionsByReferenceResponse.dto';
import { NumberFormatQueryDto } from '@/modules/BankingTransactions/dtos/NumberFormatQuery.dto';
import { RequirePermission } from '@/modules/Roles/RequirePermission.decorator';
import { PermissionGuard } from '@/modules/Roles/Permission.guard';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { AbilitySubject } from '@/modules/Roles/Roles.types';
import { ReportsAction } from '../../types/Report.types';

@Controller('reports/transactions-by-reference')
@ApiTags('Reports')
@ApiExtraModels(NumberFormatQueryDto, TransactionsByReferenceResponseDto)
@UseGuards(AuthorizationGuard, PermissionGuard)
@RequirePermission(ReportsAction.READ_GENERAL_LEDGET, AbilitySubject.Report)
export class TransactionsByReferenceController {
  constructor(
    private readonly transactionsByReferenceApp: TransactionsByReferenceApplication,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Transactions by reference',
    schema: { $ref: getSchemaPath(TransactionsByReferenceResponseDto) },
  })
  @ApiOperation({ summary: 'Get transactions by reference' })
  @ApiQuery({
    name: 'numberFormat',
    required: false,
    description:
      'Number formatting options (serialized as bracket notation, e.g. numberFormat[precision]=2)',
    schema: { $ref: getSchemaPath(NumberFormatQueryDto) },
  })
  async getTransactionsByReference(
    @Query() query: TransactionsByReferenceQueryDto,
  ) {
    const data = await this.transactionsByReferenceApp.getTransactions(query);

    return data;
  }
}
