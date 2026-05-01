import React from 'react';
import { cn } from '@/utils';

interface SkeletonProps { className?: string; }

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('skeleton rounded-xl', className)} />
);

export const ListingCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-3xl overflow-hidden shadow-card border border-accent/10">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-card rounded-3xl p-6 space-y-4 shadow-card border border-accent/10">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-2xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton className="h-px w-full" />
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export const MeetingCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl p-4 space-y-3 shadow-card border border-accent/10">
    <div className="flex justify-between">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-4 w-56" />
    <Skeleton className="h-4 w-32" />
  </div>
);
