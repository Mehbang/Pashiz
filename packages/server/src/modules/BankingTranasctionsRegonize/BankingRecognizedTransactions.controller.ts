import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/common/dtos/PaginatedResults.dto';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';
import { RecognizedTransactionsApplication } from './RecognizedTransactions.application';
import { GetRecognizedTransactionResponseDto } from './dtos/GetRecognizedTransactionResponse.dto';
import { RequirePermission } from '@/modules/Roles/RequirePermission.decorator';
import { PermissionGuard } from '@/modules/Roles/Permission.guard';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { AbilitySubject } from '@/modules/Roles/Roles.types';
import { CashflowAction } from '@/modules/BankingTransactions/types/BankingTransactions.types';

@Controller('banking/recognized')
@ApiTags('Banking Recognized Transactions')
@ApiExtraModels(GetRecognizedTransactionResponseDto, PaginatedResponseDto)
@ApiCommonHeaders()
@UseGuards(AuthorizationGuard, PermissionGuard)
@RequirePermission(CashflowAction.View, AbilitySubject.Cashflow)
export class BankingRecognizedTransactionsController {
  constructor(
    private readonly recognizedTransactionsApplication: RecognizedTransactionsApplication,
  ) {}

  @Get(':recognizedTransactionId')
  @ApiOperation({ summary: 'Get recognized transaction' })
  @ApiParam({
    name: 'recognizedTransactionId',
    description: 'The ID of the recognized transaction',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the recognized transaction details',
    schema: {
      $ref: getSchemaPath(GetRecognizedTransactionResponseDto),
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Recognized transaction not found',
  })
  async getRecognizedTransaction(
    @Param('recognizedTransactionId') recognizedTransactionId: number,
  ) {
    return this.recognizedTransactionsApplication.getRecognizedTransaction(
      Number(recognizedTransactionId),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of recognized transactions' })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Query parameters for filtering recognized transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of recognized transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: getSchemaPath(GetRecognizedTransactionResponseDto),
              },
            },
          },
        },
      ],
    },
  })
  async getRecognizedTransactions(@Query() query: any) {
    return this.recognizedTransactionsApplication.getRecognizedTransactions(
      query,
    );
  }
}
