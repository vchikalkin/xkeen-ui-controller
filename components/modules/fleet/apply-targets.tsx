'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  ApplyRouterResult,
  HealthStatus,
  Router,
} from '@/lib/types/router';
import { cn } from '@/lib/utils';

interface ApplyTargetsProps {
  readonly routers: Router[];
  readonly selectedIds: string[];
  readonly healthById: Record<string, HealthStatus | undefined>;
  readonly results: ApplyRouterResult[];
  readonly pendingIds: string[];
  readonly onChange: (ids: string[]) => void;
}

export function ApplyTargets({
  routers,
  selectedIds,
  healthById,
  results,
  pendingIds,
  onChange,
}: ApplyTargetsProps) {
  const t = useTranslations('Fleet');
  const isAllSelected =
    routers.length > 0 && selectedIds.length === routers.length;
  const resultById = new Map(
    results.map((result) => [result.routerId, result]),
  );

  if (routers.length === 0) {
    return (
      <p className="text-sm text-pretty text-zinc-600 dark:text-zinc-400">
        {t('noRoutersForTargets')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{t('targetsLabel')}</p>
        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            checked={isAllSelected}
            onChange={(event) => {
              onChange(
                event.target.checked ? routers.map((router) => router.id) : [],
              );
            }}
          />
          {t('selectAll')}
        </label>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {routers.map((router) => {
          const isChecked = selectedIds.includes(router.id);
          const isOnline = healthById[router.id]?.online;
          const label = router.name ?? router.ip;
          const isPending = pendingIds.includes(router.id);
          const result = resultById.get(router.id);
          let statusLabel: string | null = null;

          if (isPending) {
            statusLabel = t('progressPending');
          } else if (result?.ok) {
            statusLabel = t('progressOk', { stage: result.stage ?? 'save' });
          } else if (result) {
            statusLabel = t('progressError', {
              error: result.error ?? t('unknownError'),
            });
          }

          return (
            <li key={router.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-accent',
                  isChecked && 'border-border bg-secondary/60',
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selectedIds, router.id]);

                      return;
                    }

                    onChange(selectedIds.filter((id) => id !== router.id));
                  }}
                />
                <span
                  aria-hidden
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    isOnline ? 'bg-emerald-500' : 'bg-zinc-400',
                  )}
                />
                <span className="min-w-0 flex-1 truncate tabular-nums">
                  {label}
                </span>
                {statusLabel ? (
                  <span
                    title={statusLabel}
                    className={cn(
                      'max-w-40 shrink-0 truncate text-xs tabular-nums',
                      isPending && 'text-zinc-500',
                      result?.ok && 'text-emerald-600 dark:text-emerald-400',
                      result && !result.ok && 'text-destructive',
                    )}
                  >
                    {statusLabel}
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
