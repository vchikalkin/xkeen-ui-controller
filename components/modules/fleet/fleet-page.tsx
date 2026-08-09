'use client';

import { Rocket, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  createRouter,
  fetchDraft,
  fetchHealth,
  fetchRouterConfig,
  fetchRouters,
  removeRouter,
  runApplyForRouter,
  runBackupForRouter,
  saveDraft,
} from '@/lib/client/api';
import { GLOBAL_TAB } from '@/lib/fleet-constants';
import type {
  ApplyRouterResult,
  HealthStatus,
  Router,
} from '@/lib/types/router';
import { AddRouterDialog } from './add-router-dialog';
import { ApplyTargets } from './apply-targets';
import { ConfirmApplyModal } from './confirm-apply-modal';
import { type FleetTab, RouterTabs } from './router-tabs';
import { UtilitiesMenu } from './utilities-menu';
import { YamlEditor, type YamlEditorHandle } from './yaml-editor';

const HEALTH_POLL_MS = 8000;
const DRAFT_DEBOUNCE_MS = 800;

type FooterStatusTone = 'muted' | 'ok' | 'error';

interface FooterStatus {
  readonly text: string;
  readonly tone: FooterStatusTone;
}

function ignorePromise(promise: Promise<unknown>): undefined {
  promise.catch(() => undefined);

  return undefined;
}

function footerStatusClassName(tone: FooterStatusTone): string {
  if (tone === 'ok') {
    return 'text-sm text-emerald-600 dark:text-emerald-400';
  }

  if (tone === 'error') {
    return 'text-sm text-destructive';
  }

  return 'text-sm text-muted-foreground';
}

export function FleetPage() {
  const t = useTranslations('Fleet');
  const editorRef = useRef<YamlEditorHandle>(null);

  const [routers, setRouters] = useState<Router[]>([]);
  const [activeTab, setActiveTab] = useState<FleetTab>(GLOBAL_TAB);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [healthById, setHealthById] = useState<
    Record<string, HealthStatus | undefined>
  >({});
  const [content, setContent] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [results, setResults] = useState<ApplyRouterResult[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);
  const [isAddRouterOpen, setIsAddRouterOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<FleetTab | null>(null);

  const isGlobal = activeTab === GLOBAL_TAB;

  const targetRouters = useMemo(() => {
    if (isGlobal) {
      return routers.filter((router) => selectedIds.includes(router.id));
    }

    return routers.filter((router) => router.id === activeTab);
  }, [activeTab, isGlobal, routers, selectedIds]);

  const loadHealth = useCallback(async () => {
    try {
      const statuses = await fetchHealth();
      const next: Record<string, HealthStatus> = {};

      for (const status of statuses) {
        next[status.routerId] = status;
      }

      setHealthById(next);
    } catch {
      // keep previous health snapshot
    }
  }, []);

  const loadTabContent = useCallback(
    async (tab: FleetTab) => {
      setIsLoading(true);
      setActionError(null);

      try {
        const next =
          tab === GLOBAL_TAB ? await fetchDraft() : await fetchRouterConfig(tab);

        setContent(next);
        editorRef.current?.setValue(next);
        setIsDirty(false);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : t('loadConfigError'),
        );
        setContent('');
        editorRef.current?.setValue('');
        setIsDirty(false);
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        const list = await fetchRouters();

        if (isCancelled) {
          return;
        }

        setRouters(list);
        setSelectedIds(list.map((router) => router.id));
        await loadTabContent(GLOBAL_TAB);
        await loadHealth();
      } catch (error) {
        if (!isCancelled) {
          setActionError(
            error instanceof Error ? error.message : t('bootstrapError'),
          );
          setIsLoading(false);
        }
      }
    }

    ignorePromise(bootstrap());

    return () => {
      isCancelled = true;
    };
  }, [loadHealth, loadTabContent, t]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      ignorePromise(loadHealth());
    }, HEALTH_POLL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadHealth]);

  useEffect(() => {
    if (!isGlobal || !isDirty) {
      return;
    }

    const timer = window.setTimeout(() => {
      ignorePromise(saveDraft(content));
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [content, isDirty, isGlobal]);

  const requestTabChange = (tab: FleetTab) => {
    if (tab === activeTab) {
      return;
    }

    if (isDirty) {
      setPendingTab(tab);

      return;
    }

    setActiveTab(tab);
    ignorePromise(loadTabContent(tab));
  };

  const runMode = async (mode: 'save' | 'apply') => {
    if (!isValid || targetRouters.length === 0) {
      setActionError(
        targetRouters.length === 0 ? t('noTargets') : t('invalidYaml'),
      );

      return;
    }

    const value = editorRef.current?.getValue() ?? content;
    const routerIds = targetRouters.map((router) => router.id);

    setIsBusy(true);
    setActionError(null);
    setResults([]);
    setPendingIds(routerIds);

    try {
      if (isGlobal) {
        await saveDraft(value);
      }

      const outcomes = await Promise.all(
        routerIds.map(async (routerId) => {
          try {
            const result = await runApplyForRouter(routerId, value, mode);

            setResults((prev) => {
              return [
                ...prev.filter((item) => item.routerId !== routerId),
                result,
              ];
            });

            return result;
          } catch (error) {
            const result: ApplyRouterResult = {
              routerId,
              ok: false,
              stage: 'save',
              error:
                error instanceof Error ? error.message : t('actionError'),
            };

            setResults((prev) => {
              return [
                ...prev.filter((item) => item.routerId !== routerId),
                result,
              ];
            });

            return result;
          } finally {
            setPendingIds((prev) => prev.filter((id) => id !== routerId));
          }
        }),
      );

      setIsDirty(false);

      if (outcomes.some((result) => !result.ok)) {
        setActionError(t('partialFailure'));
      }

      ignorePromise(loadHealth());
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('actionError'));
      setPendingIds([]);
    } finally {
      setIsBusy(false);
      setIsApplyConfirmOpen(false);
    }
  };

  const runBackup = async () => {
    if (targetRouters.length === 0) {
      setActionError(t('noTargets'));

      return;
    }

    const routerIds = targetRouters.map((router) => router.id);

    setIsBusy(true);
    setActionError(null);
    setResults([]);
    setPendingIds(routerIds);

    try {
      const outcomes = await Promise.all(
        routerIds.map(async (routerId) => {
          try {
            const result = await runBackupForRouter(routerId);

            setResults((prev) => {
              return [
                ...prev.filter((item) => item.routerId !== routerId),
                result,
              ];
            });

            return result;
          } catch (error) {
            const result: ApplyRouterResult = {
              routerId,
              ok: false,
              stage: 'backup',
              error:
                error instanceof Error ? error.message : t('actionError'),
            };

            setResults((prev) => {
              return [
                ...prev.filter((item) => item.routerId !== routerId),
                result,
              ];
            });

            return result;
          } finally {
            setPendingIds((prev) => prev.filter((id) => id !== routerId));
          }
        }),
      );

      if (outcomes.some((result) => !result.ok)) {
        setActionError(t('backupPartialFailure'));
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('actionError'));
      setPendingIds([]);
    } finally {
      setIsBusy(false);
    }
  };

  const activeRouterResult = results.find(
    (item) => item.routerId === activeTab,
  );
  const isActiveRouterPending = pendingIds.includes(activeTab);

  let footerStatus: FooterStatus | null = null;

  if (actionError) {
    footerStatus = { text: actionError, tone: 'error' };
  } else if (!isGlobal && isActiveRouterPending) {
    footerStatus = { text: t('progressPending'), tone: 'muted' };
  } else if (
    !isGlobal &&
    activeRouterResult?.ok &&
    activeRouterResult.stage === 'backup' &&
    activeRouterResult.backupName
  ) {
    footerStatus = {
      text: t('backupOk', { name: activeRouterResult.backupName }),
      tone: 'ok',
    };
  } else if (!isGlobal && activeRouterResult?.ok) {
    footerStatus = {
      text: t('progressOk', { stage: activeRouterResult.stage ?? 'save' }),
      tone: 'ok',
    };
  } else if (!isGlobal && activeRouterResult) {
    footerStatus = {
      text: t('progressError', {
        error: activeRouterResult.error ?? t('unknownError'),
      }),
      tone: 'error',
    };
  }

  const areActionsDisabled =
    isBusy || isLoading || !isDirty || !isValid || targetRouters.length === 0;
  const isBackupDisabled = isBusy || isLoading || targetRouters.length === 0;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border border-border bg-background p-4 shadow-sm md:p-5">
        <div className="shrink-0">
          <RouterTabs
            routers={routers}
            activeTab={activeTab}
            healthById={healthById}
            onChange={requestTabChange}
            onAdd={() => {
              setAddError(null);
              setIsAddRouterOpen(true);
            }}
            onRemove={(id) => {
              ignorePromise(
                (async () => {
                  try {
                    await removeRouter(id);
                    setRouters((prev) =>
                      prev.filter((router) => router.id !== id),
                    );
                    setSelectedIds((prev) =>
                      prev.filter((item) => item !== id),
                    );

                    if (activeTab === id) {
                      setActiveTab(GLOBAL_TAB);
                      ignorePromise(loadTabContent(GLOBAL_TAB));
                    }
                  } catch (error) {
                    setActionError(
                      error instanceof Error ? error.message : t('removeError'),
                    );
                  }
                })(),
              );
            }}
          />
        </div>

        <div className="relative min-h-48 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 z-10 animate-pulse rounded-md border border-border bg-secondary/60" />
          ) : null}
          <div className="absolute inset-0">
            <YamlEditor
              ref={editorRef}
              className="h-full"
              placeholderText={t('editorPlaceholder')}
              onChange={(value, nextIsValid) => {
                setContent(value);
                setIsValid(nextIsValid);
                setIsDirty(true);
              }}
              onValidityChange={(nextIsValid) => {
                setIsValid(nextIsValid);
              }}
            />
          </div>
        </div>

        {isGlobal ? (
          <div className="shrink-0">
            <ApplyTargets
              routers={routers}
              selectedIds={selectedIds}
              healthById={healthById}
              results={results}
              pendingIds={pendingIds}
              onChange={setSelectedIds}
            />
          </div>
        ) : null}

        <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          {footerStatus ? (
            <p className={footerStatusClassName(footerStatus.tone)}>
              {footerStatus.text}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
            <Button
              variant="outline"
              disabled={areActionsDisabled}
              onClick={() => {
                ignorePromise(runMode('save'));
              }}
            >
              <Save aria-hidden className="size-4" />
              {t('save')}
            </Button>
            <Button
              disabled={areActionsDisabled}
              onClick={() => {
                setIsApplyConfirmOpen(true);
              }}
            >
              <Rocket aria-hidden className="size-4" />
              {isGlobal ? t('applySelected') : t('apply')}
            </Button>
            <UtilitiesMenu
              utilitiesLabel={t('utilities')}
              backupLabel={isGlobal ? t('backupSelected') : t('backup')}
              isBackupDisabled={isBackupDisabled}
              onBackup={() => {
                ignorePromise(runBackup());
              }}
            />
          </div>
        </div>
      </div>

      <ConfirmApplyModal
        open={isApplyConfirmOpen}
        targets={targetRouters}
        isBusy={isBusy}
        onCancel={() => {
          if (!isBusy) {
            setIsApplyConfirmOpen(false);
          }
        }}
        onConfirm={() => {
          ignorePromise(runMode('apply'));
        }}
      />

      <AddRouterDialog
        open={isAddRouterOpen}
        isBusy={isBusy}
        error={addError}
        onCancel={() => {
          setIsAddRouterOpen(false);
          setAddError(null);
        }}
        onSubmit={(input) => {
          ignorePromise(
            (async () => {
              setIsBusy(true);
              setAddError(null);

              try {
                const router = await createRouter(input);

                setRouters((prev) => [...prev, router]);
                setSelectedIds((prev) => [...prev, router.id]);
                setIsAddRouterOpen(false);
                ignorePromise(loadHealth());
              } catch (error) {
                setAddError(
                  error instanceof Error ? error.message : t('addError'),
                );
              } finally {
                setIsBusy(false);
              }
            })(),
          );
        }}
      />

      <AlertDialog
        open={pendingTab !== null}
        title={t('discardTitle')}
        description={t('discardDescription')}
        confirmLabel={t('discardConfirm')}
        cancelLabel={t('cancel')}
        confirmVariant="destructive"
        onCancel={() => {
          setPendingTab(null);
        }}
        onConfirm={() => {
          if (!pendingTab) {
            return;
          }

          const next = pendingTab;

          setPendingTab(null);
          setActiveTab(next);
          ignorePromise(loadTabContent(next));
        }}
      />
    </div>
  );
}
