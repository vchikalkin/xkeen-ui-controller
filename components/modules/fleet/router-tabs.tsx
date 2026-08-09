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
          <Plus aria-hidden className="size-4" />
          {t('addRouter')}
        </Button>
      }
    >
      <div
        role="tablist"
        aria-label={t('tabsLabel')}
        className="flex w-max items-center gap-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === GLOBAL_TAB}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors',
            activeTab === GLOBAL_TAB
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent',
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
            <div key={router.id} className="flex shrink-0 items-center">
              <button
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  'inline-flex h-9 max-w-48 items-center gap-2 rounded-l-md px-3 text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent',
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
                size="icon"
                variant={isSelected ? 'default' : 'secondary'}
                aria-label={t('removeRouter', { name: label })}
                className={cn(
                  'h-9 w-8 rounded-l-none rounded-r-md border-l border-border/40',
                  isSelected && 'border-primary-foreground/20',
                )}
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
