import { Button, InputGroup, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { AppToaster, Card, Group, Stack } from '@/components';
import { CLASSES } from '@/constants/classes';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import type { WithDashboardActionsProps } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';
import { useItemUnits } from './useItemUnits';
import type { ItemUnit } from './useItemUnits';

type UnitsPreferencesProps = Pick<
  WithDashboardActionsProps,
  'changePreferencesPageTitle'
>;

/**
 * The units of measure an organization counts its items in.
 *
 * Defined once here and chosen per item, so the same kilogram means the same
 * thing on every item that uses it.
 */
function UnitsPreferences({
  changePreferencesPageTitle,
}: UnitsPreferencesProps) {
  const { listUnits, createUnit, editUnit, deleteUnit } = useItemUnits();

  const [units, setUnits] = useState<ItemUnit[]>([]);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [editing, setEditing] = useState<ItemUnit | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    changePreferencesPageTitle(intl.get('units.title'));
  }, [changePreferencesPageTitle]);

  const refresh = useCallback(() => {
    listUnits()
      .then(setUnits)
      .catch(() => setUnits([]));
  }, [listUnits]);

  useEffect(refresh, [refresh]);

  const reset = () => {
    setEditing(null);
    setName('');
    setSymbol('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    try {
      const payload = { name: name.trim(), symbol: symbol.trim() || null };

      if (editing) {
        await editUnit(editing.id, payload);
      } else {
        await createUnit(payload);
      }
      reset();
      refresh();
    } catch (error: any) {
      // The one refusal worth naming: two units with the same name would be
      // indistinguishable in every dropdown that lists them.
      const type = error?.response?.data?.errors?.[0]?.type;
      AppToaster.show({
        message: intl.get(
          type === 'UNIT_NAME_NOT_UNIQUE'
            ? 'units.error.name_taken'
            : 'units.error.save_failed',
        ),
        intent: Intent.DANGER,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (unit: ItemUnit) => {
    try {
      await deleteUnit(unit.id);
      if (editing?.id === unit.id) reset();
      refresh();
    } catch (error: any) {
      const type = error?.response?.data?.errors?.[0]?.type;
      AppToaster.show({
        message: intl.get(
          type === 'UNIT_IN_USE'
            ? 'units.error.in_use'
            : 'units.error.delete_failed',
        ),
        intent: Intent.DANGER,
      });
    }
  };

  const startEditing = (unit: ItemUnit) => {
    setEditing(unit);
    setName(unit.name);
    setSymbol(unit.symbol ?? '');
  };

  return (
    <div className={classNames(CLASSES.PREFERENCES_PAGE_INSIDE_CONTENT)}>
      <UnitsCard>
        <Stack spacing={24}>
          <section>
            <SectionTitle>
              {intl.get(editing ? 'units.form.edit' : 'units.form.add')}
            </SectionTitle>
            <SectionDescription>
              {intl.get('units.form.description')}
            </SectionDescription>

            <form onSubmit={handleSubmit}>
              <Group spacing={10} align="flex-end">
                <Field>
                  <FieldLabel>{intl.get('units.field.name')}</FieldLabel>
                  <InputGroup
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    placeholder={intl.get('units.field.name.placeholder')}
                  />
                </Field>
                <Field style={{ maxWidth: 120 }}>
                  <FieldLabel>{intl.get('units.field.symbol')}</FieldLabel>
                  <InputGroup
                    value={symbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSymbol(e.target.value)
                    }
                    placeholder={intl.get('units.field.symbol.placeholder')}
                  />
                </Field>
                <Button type="submit" intent={Intent.PRIMARY} loading={busy}>
                  {intl.get(editing ? 'units.form.save' : 'units.form.create')}
                </Button>
                {editing && (
                  <Button onClick={reset}>{intl.get('cancel')}</Button>
                )}
              </Group>
            </form>
          </section>

          <Divider />

          <section>
            <SectionTitle>{intl.get('units.list.title')}</SectionTitle>

            {units.length ? (
              <UnitList>
                {units.map((unit) => (
                  <li key={unit.id}>
                    <UnitRow>
                      <span>
                        {unit.name}
                        {unit.symbol ? <Symbol>{unit.symbol}</Symbol> : null}
                      </span>
                      <Group spacing={8}>
                        <Button
                          minimal
                          small
                          onClick={() => startEditing(unit)}
                        >
                          {intl.get('edit')}
                        </Button>
                        <Button
                          minimal
                          small
                          intent={Intent.DANGER}
                          onClick={() => handleDelete(unit)}
                        >
                          {intl.get('delete')}
                        </Button>
                      </Group>
                    </UnitRow>
                  </li>
                ))}
              </UnitList>
            ) : (
              <SectionDescription>
                {intl.get('units.list.empty')}
              </SectionDescription>
            )}
          </section>
        </Stack>
      </UnitsCard>
    </div>
  );
}

export const Units = compose(withDashboardActions)(UnitsPreferences);

const UnitsCard = styled(Card)`
  padding: 25px;
  max-width: 700px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px;
`;

const SectionDescription = styled.p`
  color: #5f6b7c;
  margin: 0 0 16px;
  line-height: 1.7;
`;

const Divider = styled.div`
  border-top: 1px solid rgba(17, 20, 24, 0.12);

  .bp4-dark & {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
`;

const Field = styled.div`
  flex: 1;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
`;

const UnitList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const UnitRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(17, 20, 24, 0.1);

  .bp4-dark & {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
`;

const Symbol = styled.code`
  margin-inline-start: 8px;
  color: #5f6b7c;
`;
