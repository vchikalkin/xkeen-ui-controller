'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface AddRouterDialogProps {
  readonly open: boolean;
  readonly isBusy?: boolean;
  readonly error?: string | null;
  readonly onCancel: () => void;
  readonly onSubmit: (input: { ip: string; name?: string }) => void;
}

export function AddRouterDialog({
  open,
  isBusy,
  error,
  onCancel,
  onSubmit,
}: AddRouterDialogProps) {
  const t = useTranslations('Fleet');
  const [ip, setIp] = useState('');
  const [name, setName] = useState('');

  return (
    <AlertDialog
      open={open}
      title={t('addRouterTitle')}
      description={t('addRouterDescription')}
      confirmLabel={t('addRouterConfirm')}
      cancelLabel={t('cancel')}
      isBusy={isBusy}
      onCancel={() => {
        setIp('');
        setName('');
        onCancel();
      }}
      onConfirm={() => {
        onSubmit({
          ip: ip.trim(),
          ...(name.trim() ? { name: name.trim() } : {}),
        });
      }}
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span>{t('ipLabel')}</span>
          <Input
            value={ip}
            inputMode="decimal"
            autoComplete="off"
            placeholder="192.168.1.1"
            onChange={(event) => {
              setIp(event.target.value);
            }}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span>{t('nameLabel')}</span>
          <Input
            value={name}
            autoComplete="off"
            placeholder={t('namePlaceholder')}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </AlertDialog>
  );
}
