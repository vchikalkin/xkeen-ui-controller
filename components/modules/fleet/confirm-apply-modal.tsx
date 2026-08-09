'use client';

import { useTranslations } from 'next-intl';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { Router } from '@/lib/types/router';

interface ConfirmApplyModalProps {
  readonly open: boolean;
  readonly targets: Router[];
  readonly isBusy?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmApplyModal({
  open,
  targets,
  isBusy,
  onConfirm,
  onCancel,
}: ConfirmApplyModalProps) {
  const t = useTranslations('Fleet');

  return (
    <AlertDialog
      open={open}
      title={t('confirmApplyTitle')}
      description={t('confirmApplyDescription', { count: targets.length })}
      confirmLabel={t('confirmApply')}
      cancelLabel={t('cancel')}
      confirmVariant="destructive"
      isBusy={isBusy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <ul className="mt-1 max-h-40 list-disc overflow-y-auto pl-5 text-sm tabular-nums">
        {targets.map((router) => (
          <li key={router.id}>{router.name ?? router.ip}</li>
        ))}
      </ul>
    </AlertDialog>
  );
}
