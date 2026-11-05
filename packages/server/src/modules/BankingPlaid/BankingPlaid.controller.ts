import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PlaidApplication } from './PlaidApplication';
import { PlaidItemDto } from './dtos/PlaidItem.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '@/modules/Roles/RequirePermission.decorator';
import { PermissionGuard } from '@/modules/Roles/Permission.guard';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { AbilitySubject } from '@/modules/Roles/Roles.types';
import { CashflowAction } from '@/modules/BankingTransactions/types/BankingTransactions.types';

@Controller('banking/plaid')
@ApiTags('Banking Plaid')
@UseGuards(AuthorizationGuard, PermissionGuard)
@RequirePermission(CashflowAction.Create, AbilitySubject.Cashflow)
export class BankingPlaidController {
  constructor(private readonly plaidApplication: PlaidApplication) {}

  @Post('link-token')
  @ApiOperation({ summary: 'Get Plaid link token' })
  getLinkToken() {
    return this.plaidApplication.getLinkToken();
  }

  @Post('exchange-token')
  @ApiOperation({ summary: 'Exchange Plaid access token' })
  exchangeToken(@Body() itemDTO: PlaidItemDto) {
    return this.plaidApplication.exchangeToken(itemDTO);
  }
}
