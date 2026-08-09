'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  useId,
  useRef,
} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertDialogProps extends PropsWithChildren {
  readonly open: boolean;
  readonly title: string;
  readonly description?: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly confirmVariant?: 'default' | 'destructive';
  readonly isBusy?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'default',
  isBusy = false,
  onConfirm,
  onCancel,
  children,
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const setDialogNode = (node: HTMLDialogElement | null) => {
    dialogRef.current = node;

    if (!node) {
      return;
    }

    if (open && !node.open) {
      node.showModal();
    }

    if (!open && node.open) {
      node.close();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={setDialogNode}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 m-0 grid w-[min(100%-2rem,28rem)] -translate-1/2 gap-6 rounded-xl border border-border bg-card p-5 text-sm text-card-foreground shadow-lg outline-none backdrop:bg-black/40',
      )}
      onClose={onCancel}
      onCancel={(event) => {
        event.preventDefault();

        if (!isBusy) {
          onCancel();
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-xl leading-none font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description ? (
          <div
            id={descriptionId}
            className="text-sm text-pretty text-muted-foreground"
          >
            {description}
          </div>
        ) : null}
        {children}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" disabled={isBusy} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          disabled={isBusy}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
