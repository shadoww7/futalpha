import { useEffect } from 'react';
import { useNeoStore } from '../store/useNeoStore';

export function useAutomations() {
  useEffect(() => {
    const timer = window.setInterval(() => {
      const { automations, streaming, runAutomation } = useNeoStore.getState();
      if (streaming) return;
      const now = Date.now();
      for (const item of automations) {
        if (!item.enabled) continue;
        if ((item.nextRunAt ?? 0) <= now) {
          void runAutomation(item.id);
          break;
        }
      }
    }, 15_000);
    return () => window.clearInterval(timer);
  }, []);
}
