import { useEffect } from 'react';
import { useNeoStore } from '../store/useNeoStore';

export function useKeyboard() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        useNeoStore.getState().setPanel('searchOpen', true);
      }
      if (meta && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        useNeoStore.getState().newChat();
      }
      if (event.key === 'Escape') {
        const state = useNeoStore.getState();
        if (state.streaming) state.stop();
        else {
          state.setPanel('searchOpen', false);
          state.setPanel('customizeOpen', false);
          state.setPanel('automationsOpen', false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
