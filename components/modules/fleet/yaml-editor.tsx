'use client';

import { basicSetup } from 'codemirror';
import { load as loadYaml } from 'js-yaml';
import { useTheme } from 'next-themes';
import {
  forwardRef,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { indentWithTab } from '@codemirror/commands';
import { yaml } from '@codemirror/lang-yaml';
import { linter, lintGutter } from '@codemirror/lint';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view';
import { cn } from '@/lib/utils';

export interface YamlEditorHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  isValid: () => boolean;
}

interface YamlEditorProps {
  readonly className?: string;
  readonly placeholderText?: string;
  readonly onChange?: (value: string, isValid: boolean) => void;
  readonly onValidityChange?: (isValid: boolean, error?: string) => void;
}

interface LinterOptions {
  onValidityChange?: (isValid: boolean, error?: string) => void;
}

interface ValidityPayload {
  error?: string;
}

const baseEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    maxHeight: '100%',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
    overflow: 'auto',
    maxHeight: '100%',
  },
  '&.cm-focused': {
    outline: 'none',
  },
});

const lightEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--card)',
    color: 'var(--card-foreground)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--secondary)',
    color: '#71717a',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e4e4e7',
  },
  '.cm-activeLine': {
    backgroundColor: '#f4f4f5',
  },
});

/** Deepens oneDark chrome so the editor sits darker than the UI shell. */
const darkEditorSurface = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0c0c0e',
      color: '#e4e4e7',
    },
    '.cm-scroller': {
      backgroundColor: '#0c0c0e',
    },
    '.cm-content': {
      caretColor: '#e4e4e7',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#e4e4e7',
    },
    '.cm-gutters': {
      backgroundColor: '#27272a',
      color: '#a1a1aa',
      borderRight: '1px solid #3f3f46',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#3f3f46',
    },
    '.cm-activeLine': {
      backgroundColor: '#141416',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: '#27272a !important',
    },
    '.cm-selectionMatch': {
      backgroundColor: '#27272a88',
    },
  },
  { dark: true },
);

const darkEditorTheme = [oneDark, darkEditorSurface];

function createYamlLinter({ onValidityChange }: LinterOptions) {
  return linter((view) => {
    const text = view.state.doc.toString();

    if (!text.trim()) {
      onValidityChange?.(false, 'empty');

      return [
        {
          from: 0,
          to: 0,
          severity: 'error',
          message: 'Config is empty',
        },
      ];
    }

    try {
      loadYaml(text);
      onValidityChange?.(true);

      return [];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid YAML';

      onValidityChange?.(false, message);

      const mark = /at line (\d+)/u.exec(message);
      const lineNumber = mark ? Number(mark[1]) : 1;
      const line = view.state.doc.line(
        Math.min(Math.max(lineNumber, 1), view.state.doc.lines),
      );

      return [
        {
          from: line.from,
          to: line.to,
          severity: 'error',
          message,
        },
      ];
    }
  });
}

function YamlEditorInner(
  {
    className,
    placeholderText,
    onChange,
    onValidityChange,
  }: YamlEditorProps,
  // eslint-disable-next-line fsecond/prefer-destructured-optionals -- ref from forwardRef
  ref: Ref<YamlEditorHandle>,
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef(new Compartment());
  const isValidRef = useRef(true);
  const onChangeRef = useRef(onChange);
  const onValidityChangeRef = useRef(onValidityChange);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    onChangeRef.current = onChange;
    onValidityChangeRef.current = onValidityChange;
  }, [onChange, onValidityChange]);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => viewRef.current?.state.doc.toString() ?? '',
      setValue: (value: string) => {
        const view = viewRef.current;

        if (!view) {
          return;
        }

        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: value,
          },
        });
      },
      focus: () => {
        viewRef.current?.focus();
      },
      isValid: () => isValidRef.current,
    };
  });

  useEffect(() => {
    if (!parentRef.current || viewRef.current) {
      return;
    }

    const updateValidity = (
      nextIsValid: boolean,
      { error }: ValidityPayload = {},
    ) => {
      isValidRef.current = nextIsValid;
      onValidityChangeRef.current?.(nextIsValid, error);
    };

    const themeCompartment = themeCompartmentRef.current;
    const state = EditorState.create({
      doc: '',
      extensions: [
        basicSetup,
        yaml(),
        lineNumbers(),
        lintGutter(),
        createYamlLinter({
          onValidityChange: (nextIsValid, error) => {
            updateValidity(nextIsValid, { error });
          },
        }),
        placeholder(placeholderText ?? ''),
        keymap.of([indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current?.(
              update.state.doc.toString(),
              isValidRef.current,
            );
          }
        }),
        baseEditorTheme,
        themeCompartment.of(isDark ? darkEditorTheme : lightEditorTheme),
      ],
    });

    const view = new EditorView({
      state,
      parent: parentRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Theme is applied in a separate effect after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, [placeholderText]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    view.dispatch({
      effects: themeCompartmentRef.current.reconfigure(
        isDark ? darkEditorTheme : lightEditorTheme,
      ),
    });
  }, [isDark]);

  return (
    <div
      ref={parentRef}
      className={cn(
        'size-full min-h-0 overflow-hidden rounded-md border border-border bg-card dark:bg-[#0c0c0e] [&_.cm-editor]:h-full [&_.cm-editor]:max-h-full',
        className,
      )}
    />
  );
}

export const YamlEditor = forwardRef<YamlEditorHandle, YamlEditorProps>(
  YamlEditorInner,
);

YamlEditor.displayName = 'YamlEditor';
