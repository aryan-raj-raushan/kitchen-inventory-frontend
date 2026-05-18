'use client';

type Size = 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-3',
};

export function Spinner({ size = 'md' }: { size?: Size }) {
  return (
    <span
      className={`inline-block rounded-full border-current border-r-transparent animate-spin ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
