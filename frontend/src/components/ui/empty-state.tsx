import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-10 h-10 text-slate-400" />,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 lg:p-16 text-center rounded-xl bg-white border border-slate-200/80 shadow-subtle">
      <div className="p-4 bg-slate-100/80 rounded-2xl mb-4 text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
