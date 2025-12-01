import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Users, 
  Lightning, 
  CheckCircle, 
  ArrowClockwise
} from '@phosphor-icons/react';
import type { CareerMove } from '../../types';
import { Badge, Button } from '../ui';

interface CareerMoveCardProps {
  move: CareerMove;
  onCommit: (moveId: string) => void;
  onComplete: (moveId: string) => void;
  onRegenerate: (moveId: string) => void;
}

export const CareerMoveCard: React.FC<CareerMoveCardProps> = ({
  move,
  onCommit,
  onComplete,
  onRegenerate,
}) => {
  const categoryConfig = {
    impact: { 
      icon: Target, 
      label: 'Impact Move', 
      color: 'blue',
    },
    relationship: { 
      icon: Users, 
      label: 'Relationship Move', 
      color: 'purple',
    },
    craft: { 
      icon: Lightning, 
      label: 'Craft Move', 
      color: 'cyan',
    },
  };

  const config = categoryConfig[move.category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        borderWidth: '1px',
        borderRadius: '5px',
      }}
    >
      {/* Thin top accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: 'var(--accent-soft-peach)' }}
      />
      
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-sidebar)' }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <Badge 
              variant={config.color as 'blue' | 'purple' | 'cyan'} 
              size="sm"
            >
              {config.label}
            </Badge>
          </div>

          {move.completed && (
            <div className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              <CheckCircle className="w-3 h-3" />
              DONE
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className={`font-medium text-sm mb-2 ${move.completed ? 'line-through' : ''}`} style={{ color: 'var(--text-primary)' }}>
          {move.title}
        </h4>

        {/* Description */}
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {move.description}
        </p>

        {/* Competency Tags */}
        {move.linkedCompetencies.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {move.linkedCompetencies.map((comp) => (
              <Badge key={comp} variant="default" size="sm">
                {comp.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {!move.completed && (
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => onRegenerate(move.id)}
              className="text-xs font-mono flex items-center gap-1 transition-colors"
              style={{ color: 'var(--text-secondary)', fontSize: '11px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <ArrowClockwise className="w-3 h-3" />
              DIFFERENT SUGGESTION
            </button>

            {move.committed ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onComplete(move.id)}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Mark Complete
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCommit(move.id)}
              >
                Commit to this
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

