import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-4 shrink-0 cursor-pointer rounded-[4px] border border-input accent-primary shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Checkbox };
