import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-stone-200/80 rounded-xl relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-stone-300/50 before:to-transparent ${className}`}
      {...props}
    />
  );
};

export const SkeletonStatCard = ({ mini = false }) => {
  if (mini) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col items-center justify-center space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.03)] flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-start">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
};

export const SkeletonTableRow = () => {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 mb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
      <div className="flex items-center gap-4 min-w-0">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
