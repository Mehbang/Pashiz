import intl from 'react-intl-universal';
import {
  Classes,
  Popover,
  PopoverInteractionKind,
  Position,
} from '@blueprintjs/core';
import React from 'react';
import styled from 'styled-components';
import { PaymentMethodSelectField } from './PaymentMethodSelect';
import { Stack } from '@/components';

interface PaymentOptionsButtonPopverProps {
  paymentMethods: Array<any>;
  children: React.ReactNode;
}
export function PaymentOptionsButtonPopver({
  paymentMethods,
  children,
}: PaymentOptionsButtonPopverProps) {
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.TOP_RIGHT}
      popoverClassName={Classes.POPOVER_CONTENT_SIZING}
      minimal={true}
      content={
        <Stack spacing={8}>
          <PaymentMethodsTitle>
            {intl.get('payment_options')}
          </PaymentMethodsTitle>

          <Stack spacing={8}>
            {paymentMethods?.map((service, key) => (
              <PaymentMethodSelectField
                name={`payment_methods.${service.id}.enable`}
                label={intl.get('card_stripe')}
                key={key}
              />
            ))}
          </Stack>
        </Stack>
      }
    >
      {children}
    </Popover>
  );
}

const PaymentMethodsTitle = styled('h6')`
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  color: var(--color-muted-text);
`;
