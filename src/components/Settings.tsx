import * as React from 'react';
import { Stack, Toggle, Link } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrateLocal, selectTimers } from '../store/timersSlice';
import { selectPreserveLocal, setPreserveLocal } from '../store/settingsSlice';

const LS_KEY = 'localTimerState';
const LS_PRESERVE = 'settings.preserveLocal';

function detectTabs(): boolean {
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get('tabs');
  if (q === '1' || q?.toLowerCase() === 'true') return true;
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/tabs')) return true;
  const hash = window.location.hash.toLowerCase();
  if (hash.includes('tabs')) return true;
  return false;
}

export const Settings: React.FC = () => {
  const dispatch = useDispatch<any>();
  const preserve = useSelector(selectPreserveLocal);
  const local = useSelector(selectTimers).find((t: any) => t.id === 'local');
  const [isTabs, setIsTabs] = React.useState<boolean>(() => detectTabs());

  React.useEffect(() => {
    const keep =
      localStorage.getItem(LS_PRESERVE) === '1' ||
      localStorage.getItem(LS_PRESERVE) === 'true';

    if (keep) {
      dispatch(setPreserveLocal(true));
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch(hydrateLocal(parsed));
      }
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (!local) return;
    if (preserve) {
      localStorage.setItem(LS_PRESERVE, '1');
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ base: local.base, receivedAt: local.receivedAt }),
      );
    } else {
      localStorage.removeItem(LS_PRESERVE);
      localStorage.removeItem(LS_KEY);
    }
  }, [preserve, local?.base, local?.receivedAt]);

  const toggleTabsMode = () => {
    const url = new URL(window.location.href);
    if (isTabs) {
      url.pathname = url.pathname.replace(/\/tabs\/?$/,'');
      url.searchParams.delete('tabs');
    } else {
      url.searchParams.set('tabs', '1');
    }
    window.location.href = url.toString();
  };

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Toggle
        label="Preserve local timer between sessions"
        checked={preserve}
        onChange={(_, v) => dispatch(setPreserveLocal(!!v))}
      />

      <Link onClick={toggleTabsMode}>
        {isTabs ? 'Switch to single-page view' : 'Switch to Tabs view'}
      </Link>
    </Stack>
  );
};
