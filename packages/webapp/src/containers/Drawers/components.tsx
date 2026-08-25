// @ts-nocheck
import { PashizBrand } from '@/components/Icons/PashizBrand';
import React from 'react';
import { Icon, If, Money } from '@/components';
import { formatDateLocalized } from '@/utils/locale';

export const TemplateHeader = ({ defaultLabels }) => (
  <div className={'template__header'}>
    <div className={'template__header--title'}>
      <h1>{defaultLabels.name}</h1>
      <p>info@bigcapital.ly </p>
    </div>
    <PashizBrand height={28} />
  </div>
);

export const TemplateContent = ({
  defaultLabels,
  billedTo,
  date,
  referenceNo,
  amount,
  billedFrom,
  dueDate,
  currencyCode,
}) => (
  <div className="template__content">
    <div className="template__content__info">
      <span> {defaultLabels.billedTo} </span>
      <p className={'info-paragraph'}>{billedTo}</p>
    </div>
    <div className="template__content__info">
      <span> {defaultLabels.date} </span>
      <p className={'info-paragraph'}>
        {formatDateLocalized(date, 'YYYY MMM DD')}
      </p>
    </div>
    <div className="template__content__info">
      <span> {defaultLabels.refNo} </span>
      <p className={'info-paragraph'}>{referenceNo}</p>
    </div>
    <div className="template__content__info">
      <span> {defaultLabels.amount} </span>
      <p className={'info-paragraph-amount'}>
        {<Money amount={amount} currency={currencyCode} />}
      </p>
    </div>
    <div className="template__content__info">
      <span> {defaultLabels.billedFrom} </span>
      <p className={'info-paragraph'}>{billedFrom}</p>
    </div>
    <div className="template__content__info">
      <If condition={dueDate}>
        <span> {defaultLabels.dueDate} </span>
        <p className={'info-paragraph'}>
          {formatDateLocalized(dueDate, 'YYYY MMM DD')}
        </p>
      </If>
    </div>
  </div>
);
