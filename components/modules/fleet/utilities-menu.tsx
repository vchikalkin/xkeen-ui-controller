'use client';

import { Archive, ChevronDown } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UtilitiesMenuProps {
  readonly utilitiesLabel: string;
  readonly backupLabel: string;
  readonly isBackupDisabled: boolean;
  readonly onBackup: () => void;
}

export function UtilitiesMenu({
  utilitiesLabel,
  backupLabel,
  isBackupDisabled,
  onBackup,
}: UtilitiesMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEventListener('pointerdown', (event) => {
    if (!isOpen) {
      return;
    }

    if (!rootRef.current?.contains(event.target as Node)) {
      setIsOpen(false);
    }
  });

  useEventListener('keydown', (event) => {
    if (!isOpen || event.key !== 'Escape') {
      return;
    }

    setIsOpen(false);
  });

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="outline"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {utilitiesLabel}
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 transition-transform',
            isOpen ? 'rotate-0' : 'rotate-180',
          )}
        />
      </Button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 bottom-full z-50 mb-1 min-w-44 rounded-md border border-border bg-card p-1 text-card-foreground shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            disabled={isBackupDisabled}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {
              setIsOpen(false);
              onBackup();
            }}
          >
            <Archive aria-hidden className="size-4 shrink-0" />
            {backupLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
