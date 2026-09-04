'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/components/ui/primitives';

/**
 * A section that fades and lifts into place the first time it is
 * scrolled near.
 *
 * The effect is strictly additive: the element is rendered in its final
 * position by the server, and the transform is only ever applied by
 * this component after it has mounted and confirmed the visitor has not
 * asked for reduced motion. A visitor with JavaScript disabled, or with
 * Reduce Motion on, sees the finished page with nothing hidden — the
 * common failure of scroll-reveal libraries, where content stays at
 * `opacity: 0` forever, cannot happen here.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds. Kept small — this is punctuation. */
  delay?: number;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    const node = ref.current;
    if (!node) return;

    // Anything already on screen at mount is shown without animating,
    // so the first viewport never flickers.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setArmed(true);
      setShown(true);
      return;
    }

    setArmed(true);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={armed && !shown ? { transitionDelay: `${delay}ms` } : undefined}
      className={cx(
        armed &&
          'transition-[opacity,transform] duration-700 ease-[var(--ease-out-soft)]',
        armed && !shown && 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
