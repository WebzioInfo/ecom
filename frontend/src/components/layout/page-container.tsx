import React from 'react';

export interface PageContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  actions,
  children,
}) => {
  return (
    <div className="w-full min-h-full p-8 lg:p-10 flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-base text-slate-500 font-normal leading-relaxed">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      {/* Main Page Content */}
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
};
