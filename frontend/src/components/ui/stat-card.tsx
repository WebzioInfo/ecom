import React from 'react';
import { Card } from './card';
import { Badge } from './badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
  badgeText,
}) => {
  return (
    <Card padding="md" className="relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1">{value}</div>
        </div>

        {icon && (
          <div className="p-3 bg-slate-100/80 rounded-xl text-slate-600 shrink-0 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-slate-100">
        {change && (
          <Badge
            variant={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'danger' : 'neutral'}
            dot={false}
          >
            <span className="inline-flex items-center gap-0.5">
              {changeType === 'positive' ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : changeType === 'negative' ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : null}
              {change}
            </span>
          </Badge>
        )}
        {badgeText && <Badge variant="neutral">{badgeText}</Badge>}
        {subtitle && <span className="text-xs text-slate-500 font-normal">{subtitle}</span>}
      </div>
    </Card>
  );
};
