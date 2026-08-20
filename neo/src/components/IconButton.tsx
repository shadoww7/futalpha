import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function IconButton({ active, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-neo-muted transition hover:bg-white/[0.04] hover:text-neo-text disabled:opacity-40',
        active && 'bg-white/[0.06] text-neo-text',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
