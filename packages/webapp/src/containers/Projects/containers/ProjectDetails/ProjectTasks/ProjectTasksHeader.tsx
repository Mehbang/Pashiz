// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent } from '@blueprintjs/core';
import React from 'react';
import {
  DetailFinancialCard,
  DetailFinancialSection,
  FinancialProgressBar,
  FinancialCardText,
} from '../components';
import { useProjectTaskContext } from './ProjectTaskProvider';
import { FormatDate } from '@/components';
import { calculateStatus } from '@/utils';

/**
 * Project Tasks header.
 * @returns
 */
export function ProjectTasksHeader() {
  const { project } = useProjectTaskContext();

  return (
    <DetailFinancialSection>
      <DetailFinancialCard
        label={intl.get('project_estimate')}
        value={project.cost_estimate_formatted}
      />
      <DetailFinancialCard label={intl.get('invoiced')} value={'0.00'}>
        <FinancialCardText>0% of project estimate</FinancialCardText>
        <FinancialProgressBar intent={Intent.NONE} value={0} />
      </DetailFinancialCard>
      <DetailFinancialCard label={intl.get('time_expenses')} value={'0.00'}>
        <FinancialCardText>0% of project estimate</FinancialCardText>
        <FinancialProgressBar intent={Intent.NONE} value={0} />
      </DetailFinancialCard>

      <DetailFinancialCard label={intl.get('to_be_invoiced')} value={'3.14'} />
      <DetailFinancialCard
        label={intl.get('deadline')}
        value={<FormatDate value={project.deadline_formatted} />}
      >
        <FinancialCardText>4 days to go</FinancialCardText>
      </DetailFinancialCard>
    </DetailFinancialSection>
  );
}
