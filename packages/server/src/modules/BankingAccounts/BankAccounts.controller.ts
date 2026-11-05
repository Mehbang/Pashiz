import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BankAccountsApplication } from './BankAccountsApplication.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BankAccountsQueryDto } from './dtos/BankAccountsQuery.dto';
import { BankAccountResponseDto } from './dtos/BankAccountResponse.dto';
import { RequirePermission } from '@/modules/Roles/RequirePermission.decorator';
import { PermissionGuard } from '@/modules/Roles/Permission.guard';
import { AuthorizationGuard } from '@/modules/Roles/Authorization.guard';
import { AbilitySubject } from '@/modules/Roles/Roles.types';
import { CashflowAction } from '@/modules/BankingTransactions/types/BankingTransactions.types';

@Controller('banking/accounts')
@ApiTags('Bank Accounts')
@UseGuards(AuthorizationGuard, PermissionGuard)
@RequirePermission(CashflowAction.View, AbilitySubject.Cashflow)
export class BankAccountsController {
  constructor(private bankAccountsApplication: BankAccountsApplication) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve the bank accounts.' })
  @ApiResponse({
    status: 200,
    description: 'List of bank accounts retrieved successfully.',
    type: [BankAccountResponseDto],
  })
  getBankAccounts(@Query() filterDto: BankAccountsQueryDto) {
    return this.bankAccountsApplication.getBankAccounts(filterDto);
  }

  @Get(':bankAccountId/summary')
  @ApiOperation({ summary: 'Retrieve the bank account summary.' })
  getBankAccountSummary(@Param('bankAccountId') bankAccountId: number) {
    return this.bankAccountsApplication.getBankAccountSumnmary(bankAccountId);
  }

  @Post(':id/disconnect')
  @RequirePermission(CashflowAction.Create, AbilitySubject.Cashflow)
  @ApiOperation({
    summary: 'Disconnect the bank connection of the given bank account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account disconnected successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found.',
  })
  async disconnectBankAccount(@Param('id') bankAccountId: number) {
    return this.bankAccountsApplication.disconnectBankAccount(bankAccountId);
  }

  @Post(':id/refresh')
  @RequirePermission(CashflowAction.Create, AbilitySubject.Cashflow)
  @ApiOperation({
    summary: 'Refresh the bank account transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account transactions refreshed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found.',
  })
  async refreshBankAccount(@Param('id') bankAccountId: number) {
    return this.bankAccountsApplication.refreshBankAccount(bankAccountId);
  }

  @Post(':id/pause')
  @RequirePermission(CashflowAction.Create, AbilitySubject.Cashflow)
  @ApiOperation({
    summary: 'Pause transactions syncing of the given bank account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account transactions paused successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found.',
  })
  async pauseBankAccount(@Param('id') bankAccountId: number) {
    return this.bankAccountsApplication.pauseBankAccount(bankAccountId);
  }

  @Post(':id/resume')
  @RequirePermission(CashflowAction.Create, AbilitySubject.Cashflow)
  @ApiOperation({
    summary: 'Resume transactions syncing of the given bank account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account transactions resumed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found.',
  })
  async resumeBankAccount(@Param('id') bankAccountId: number) {
    return this.bankAccountsApplication.resumeBankAccount(bankAccountId);
  }
}
