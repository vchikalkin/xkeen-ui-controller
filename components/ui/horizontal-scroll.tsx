'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SCROLL_STEP = 200;

interface HorizontalScrollProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly trailing?: ReactNode;
  readonly scrollLabelPrev: string;
  readonly scrollLabelNext: string;
  readonly contentClassName?: string;
}

export function HorizontalScroll({
  children,
  trailing,
  scrollLabelPrev,
  scrollLabelNext,
  contentClassName,
  className,
  ...props
}: HorizontalScrollProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateOverflow = useCallback(() => {
    const el = scrollerRef.current;

    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setCanPrev(scrollLeft > 1);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;

    if (!el) {
      return;
    }

    updateOverflow();

    const resizeObserver = new ResizeObserver(() => {
      updateOverflow();
    });

    resizeObserver.observe(el);

    for (const child of el.children) {
      resizeObserver.observe(child);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [children, updateOverflow]);

  // React onWheel is passive and cannot preventDefault; native listener needed.
  // eslint-disable-next-line fsecond/valid-event-listener -- passive: false for wheel
  useEffect(() => {
    const el = scrollerRef.current;

    if (!el) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (delta === 0) {
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 0) {
        return;
      }

      const next = Math.min(maxScroll, Math.max(0, scrollLeft + delta));

      if (next === scrollLeft) {
        return;
      }

      event.preventDefault();
      el.scrollLeft = next;
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const shouldShowControls = canPrev || canNext;

  return (
    <div className={cn('flex min-w-0 items-center gap-1', className)} {...props}>
      {shouldShowControls ? (
        <Button
          size="icon"
          variant="ghost"
          disabled={!canPrev}
          aria-label={scrollLabelPrev}
          className="size-8 shrink-0"
          onClick={() => {
            scrollerRef.current?.scrollBy({
              left: -SCROLL_STEP,
              behavior: 'smooth',
            });
          }}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </Button>
      ) : null}

      <div
        ref={scrollerRef}
        className={cn(
          'min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          contentClassName,
        )}
        onScroll={updateOverflow}
      >
        {children}
      </div>

      {shouldShowControls ? (
        <Button
          size="icon"
          variant="ghost"
          disabled={!canNext}
          aria-label={scrollLabelNext}
          className="size-8 shrink-0"
          onClick={() => {
            scrollerRef.current?.scrollBy({
              left: SCROLL_STEP,
              behavior: 'smooth',
            });
          }}
        >
          <ChevronRight aria-hidden className="size-4" />
        </Button>
      ) : null}

      {trailing}
    </div>
  );
}
