'use client';

import { useTranslations } from 'next-intl';
import type { ApplyRouterResult, Router } from '@/lib/types/router';
import { cn } from '@/lib/utils';

interface ApplyProgressProps {
  readonly routers: Router[];
  readonly results: ApplyRouterResult[];
  readonly pendingIds: string[];
}

export function ApplyProgress({
  routers,
  results,
  pendingIds,
}: ApplyProgressProps) {
  const t = useTranslations('Fleet');

  if (pendingIds.length === 0 && results.length === 0) {
    return null;
  }

  const byId = new Map(results.map((result) => [result.routerId, result]));
  const ids = [...new Set([...pendingIds, ...results.map((r) => r.routerId)])];

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="mb-2 text-sm font-medium">{t('progressTitle')}</p>
      <ul className="flex flex-col gap-1.5">
        {ids.map((id) => {
          const router = routers.find((item) => item.id === id);
          const label = router?.name ?? router?.ip ?? id;
          const isPending = pendingIds.includes(id);
          const result = byId.get(id);
          let statusLabel = t('progressError', {
            error: result?.error ?? t('unknownError'),
          });

          if (isPending) {
            statusLabel = t('progressPending');
          } else if (result?.ok) {
            statusLabel = t('progressOk', { stage: result.stage ?? 'save' });
          }

          return (
            <li
              key={id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="truncate tabular-nums">{label}</span>
              <span
                className={cn(
                  'shrink-0 text-right',
                  isPending && 'text-zinc-500',
                  result?.ok && 'text-emerald-600 dark:text-emerald-400',
                  result && !result.ok && 'text-destructive',
                )}
              >
                {statusLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
