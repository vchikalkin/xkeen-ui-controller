'use client';

import { Globe, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';
import { GLOBAL_TAB } from '@/lib/fleet-constants';
import type { HealthStatus, Router } from '@/lib/types/router';
import { cn } from '@/lib/utils';

export type FleetTab = string;

interface RouterTabsProps {
  readonly routers: Router[];
  readonly activeTab: FleetTab;
  readonly healthById: Record<string, HealthStatus | undefined>;
  readonly onChange: (tab: FleetTab) => void;
  readonly onAdd: () => void;
  readonly onRemove: (id: string) => void;
}

export function RouterTabs({
  routers,
  activeTab,
  healthById,
  onChange,
  onAdd,
  onRemove,
}: RouterTabsProps) {
  const t = useTranslations('Fleet');

  return (
    <HorizontalScroll
      scrollLabelPrev={t('scrollPrev')}
      scrollLabelNext={t('scrollNext')}
      trailing={
        <Button size="sm" variant="outline" className="shrink-0" onClick={onAdd}>
          <Plus aria-hidden />
          {t('addRouter')}
        </Button>
      }
    >
      <div
        role="tablist"
        aria-label={t('tabsLabel')}
        className="flex w-max items-center gap-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === GLOBAL_TAB}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium whitespace-nowrap transition-all',
            activeTab === GLOBAL_TAB
              ? 'border-border bg-background text-foreground shadow-sm'
              : 'border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
          onClick={() => {
            onChange(GLOBAL_TAB);
          }}
        >
          <Globe aria-hidden className="size-4" />
          {t('globalTab')}
        </button>

        {routers.map((router) => {
          const label = router.name ?? router.ip;
          const isOnline = healthById[router.id]?.online;
          const isSelected = activeTab === router.id;

          return (
            <div
              key={router.id}
              className={cn(
                'flex shrink-0 items-center overflow-hidden rounded-md border',
                isSelected
                  ? 'border-border bg-background shadow-sm'
                  : 'border-transparent bg-muted',
              )}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  'inline-flex h-8 max-w-48 items-center gap-1.5 px-2.5 text-sm font-medium transition-colors',
                  isSelected
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => {
                  onChange(router.id);
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    isOnline === true && 'bg-emerald-500',
                    isOnline === false && 'bg-muted-foreground/50',
                    isOnline === undefined && 'bg-muted-foreground/30',
                  )}
                />
                <span className="truncate tabular-nums">{label}</span>
              </button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('removeRouter', { name: label })}
                className="size-8 rounded-none border-l border-border/50 hover:bg-accent"
                onClick={() => {
                  onRemove(router.id);
                }}
              >
                <X aria-hidden className="size-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </HorizontalScroll>
  );
}
