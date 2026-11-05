import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/common/dtos/PaginatedResults.dto';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { BankingTransactionsApplication } from '../BankingTransactionsApplication.service';
import { GetPendingTransactionsQueryDto } from '../dtos/GetPendingTransactionsQuery.dto';
import { GetPendingTransactionResponseDto } from '../dtos/GetPendingTransactionResponse.dto';
import { RequirePermission } from '@/modules/Roles/RequirePermission.decorator';
import { PermissionGuard } from '@/modules/Roles/Permission.guard';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { AbilitySubject } from '@/modules/Roles/Roles.types';
import { CashflowAction } from '../types/BankingTransactions.types';

@Controller('banking/pending')
@ApiTags('Banking Pending Transactions')
@ApiExtraModels(GetPendingTransactionResponseDto, PaginatedResponseDto)
@ApiCommonHeaders()
@UseGuards(AuthorizationGuard, PermissionGuard)
@RequirePermission(CashflowAction.View, AbilitySubject.Cashflow)
export class BankingPendingTransactionsController {
  constructor(
    private readonly bankingTransactionsApplication: BankingTransactionsApplication,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get pending bank account transactions' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of pending bank account transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(GetPendingTransactionResponseDto) },
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'accountId',
    required: false,
    type: Number,
    description: 'Filter by bank account ID',
  })
  async getPendingTransactions(@Query() query: GetPendingTransactionsQueryDto) {
    return this.bankingTransactionsApplication.getPendingBankAccountTransactions(
      query,
    );
  }
}
