import intl from 'react-intl-universal';
import { Intent, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import { useTaxRateDetailsContext } from './TaxRateDetailsContentBoot';
import { Card, DetailItem, DetailsMenu } from '@/components';

export function TaxRateDetailsContentDetails() {
  const { taxRate } = useTaxRateDetailsContext();

  return (
    <Card>
      <div>
        <TaxRateHeader>
          <TaxRateAmount>{taxRate?.rate}%</TaxRateAmount>
          {taxRate?.active ? (
            <TaxRateActiveTag round={false} intent={Intent.SUCCESS} minimal>
              {intl.get('active')}
            </TaxRateActiveTag>
          ) : (
            <TaxRateActiveTag round={false} intent={Intent.NONE} minimal>
              {intl.get('inactive')}
            </TaxRateActiveTag>
          )}
        </TaxRateHeader>
        <DetailsMenu direction={'horizantal'} minLabelSize={200}>
          <DetailItem
            label={intl.get('tax_rate_name')}
            children={taxRate?.name}
          />
          <DetailItem label={intl.get('code')} children={taxRate?.code} />
          <DetailItem
            label={intl.get('description')}
            children={taxRate?.description || '-'}
          />
          <DetailItem
            label={intl.get('non_recoverable')}
            children={
              taxRate?.isNonRecoverable ? (
                <Tag round={false} intent={Intent.SUCCESS} minimal>
                  {intl.get('enabled')}
                </Tag>
              ) : (
                <Tag round={false} intent={Intent.NONE} minimal>
                  {intl.get('disabled')}
                </Tag>
              )
            }
          />
          <DetailItem
            label={intl.get('compound')}
            children={
              taxRate?.isCompound ? (
                <Tag round={false} intent={Intent.SUCCESS} minimal>
                  {intl.get('enabled')}
                </Tag>
              ) : (
                <Tag round={false} intent={Intent.NONE} minimal>
                  {intl.get('disabled')}
                </Tag>
              )
            }
          />
        </DetailsMenu>
      </div>
    </Card>
  );
}

const TaxRateHeader = styled(`div`)`
  margin-bottom: 1.25rem;
  display: flex;
  align-items: flex-start;
  margin-top: 0.25rem;
`;

const TaxRateAmount = styled('div')`
  line-height: 1;
  font-size: 30px;
  font-weight: 600;
  display: inline-block;
  color: var(--x-color-amount-text, #565b71);

  .bp4-dark & {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const TaxRateActiveTag = styled(Tag)`
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 1rem;
`;
