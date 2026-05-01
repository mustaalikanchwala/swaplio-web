import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Calendar, Plus } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'listings' | 'search' | 'meetings' | 'none';
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

const icons = { listings: ShoppingBag, search: Search, meetings: Calendar, none: null };

export const EmptyState: React.FC<EmptyStateProps> = ({
  title, description, icon = 'none', actionLabel, actionTo, onAction,
}) => {
  const navigate = useNavigate();
  const Icon = icons[icon];

  const handleAction = () => {
    if (onAction) onAction();
    else if (actionTo) navigate(actionTo);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      {Icon && (
        <div className="mb-6 p-6 rounded-3xl bg-card border border-accent/15 shadow-card glow-soft">
          <Icon size={48} className="text-accent/50" />
        </div>
      )}
      <h3 className="text-2xl font-display font-semibold text-gradient mb-3">{title}</h3>
      <p className="text-muted max-w-sm mb-8">{description}</p>
      {actionLabel && (
        <Button id="empty-state-action-btn" variant="accent" size="lg" onClick={handleAction} leftIcon={<Plus size={16} />}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
