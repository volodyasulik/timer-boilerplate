import * as React from 'react';
import type {
  IColumn} from '@fluentui/react';
import {
  DetailsList,
  PrimaryButton,
  DefaultButton,
  Stack,
  TextField,
} from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  computeValue,
  fetchTimerList,
  fetchTimerValue,
  nowTick,
  resetServerTimer,
  resetLocal,
  selectNow,
  selectTimers,
} from '../store/timersSlice';
import { formatHHMMSS } from '../utils/format';

export const TimersTable: React.FC = () => {
  const dispatch = useDispatch<any>();
  const now = useSelector(selectNow);
  const timers = useSelector(selectTimers);

  const [newId, setNewId] = React.useState('');
  const [error, setError] = React.useState<string | undefined>(undefined);
  const trimmed = newId.trim();

  React.useEffect(() => {
    dispatch(fetchTimerList()).then((a: any) => {
      if (a.meta.requestStatus === 'fulfilled') {
        a.payload.forEach((id: string) => dispatch(fetchTimerValue(id)));
      }
    });
  }, [dispatch]);

  React.useEffect(() => {
    const i = setInterval(() => dispatch(nowTick(Date.now())), 1000);
    return () => clearInterval(i);
  }, [dispatch]);

  const handleAdd = async () => {
    if (!trimmed) {
      setError('Enter timer name');
      return;
    }
    if (timers.some((t: any) => t.id === trimmed)) {
      setError('Timer already exists');
      return;
    }
    setError(undefined);
    await dispatch(fetchTimerValue(trimmed));
    setNewId('');
  };

  const columns: IColumn[] = [
    { key: 'id', name: 'Name', fieldName: 'id', minWidth: 140 },
    {
      key: 'value',
      name: 'Value',
      minWidth: 140,
      onRender: (item: any) => (
        <span>{formatHHMMSS(computeValue(item, now))}</span>
      ),
    },
    {
      key: 'actions',
      name: 'Action',
      minWidth: 160,
      onRender: (item: any) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          {item.isLocal ? (
            <DefaultButton onClick={() => dispatch(resetLocal())} text="Reset" />
          ) : (
            <PrimaryButton
              text={item.loadingReset ? 'Resetting...' : 'Reset'}
              disabled={item.loadingReset}
              onClick={() => dispatch(resetServerTimer(item.id))}
            />
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <DetailsList items={timers} columns={columns} />
      <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 8 }}>
        <TextField
          label="New timer"
          placeholder="name"
          value={newId}
          errorMessage={error}
          onChange={(_, v) => {
            setNewId(v || '');
            if (error) setError(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          styles={{ root: { maxWidth: 280 } }}
        />
        <PrimaryButton
          text="Add"
          onClick={handleAdd}
          disabled={!trimmed}
        />
      </Stack>
    </Stack>
  );
};
