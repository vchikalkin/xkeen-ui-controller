import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-[13px] shadow-xs transition-colors outline-none placeholder:text-[13px] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
