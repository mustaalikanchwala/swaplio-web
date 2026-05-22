import type { ReactNode } from 'react';
import clsx from 'clsx';

interface ListingGridProps {
  children: ReactNode;
  className?: string;
}

export function ListingGrid({ children, className }: ListingGridProps) {
  return (
    <div
      className={clsx(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="glass overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 flex flex-col gap-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded mt-2" />
      </div>
    </div>
  );
}
