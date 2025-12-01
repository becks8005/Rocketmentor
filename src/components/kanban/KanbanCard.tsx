import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  ChatCircle,
  Trophy,
  Trash,
  Sparkle,
  DotsThree,
  DotsSixVertical
} from '@phosphor-icons/react';
import type { KanbanCard as KanbanCardType } from '../../types';
import { Badge, Modal, Textarea, Button, Select } from '../ui';
import { CARD_TYPES } from '../../data/constants';

interface KanbanCardProps {
  card: KanbanCardType;
  onUpdate: (card: KanbanCardType) => void;
  onDelete: (id: string) => void;
  onMarkWin: (card: KanbanCardType) => void;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  onUpdate,
  onDelete,
  onMarkWin,
  isDragging = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notes, setNotes] = useState(card.notes);

  const cardType = CARD_TYPES.find(t => t.value === card.type);
  
  const badgeVariant = {
    deliverable: 'blue',
    meeting: 'purple',
    analysis: 'cyan',
    workshop: 'amber',
    internal: 'green',
    other: 'default',
  }[card.type] as 'blue' | 'purple' | 'cyan' | 'amber' | 'green' | 'default';

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...card, completed: !card.completed });
  };

  const handleSaveNotes = () => {
    onUpdate({ ...card, notes });
    setShowDetails(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`
          relative group
          p-3
          ${card.completed ? 'opacity-60' : ''}
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          transition-all duration-200 ease-out
        `}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: card.isSuggested ? 'var(--border-subtle)' : 'var(--border-subtle)',
          borderWidth: '1px',
          borderStyle: card.isSuggested ? 'dashed' : 'solid',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 15, 15, 0.04)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={() => setShowDetails(true)}
      >
        {/* Drag Handle */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DotsSixVertical className="w-4 h-4 text-text-muted" />
        </div>

        {/* Card Content */}
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium line-clamp-2 ${card.completed ? 'line-through' : ''}`} style={{ color: 'var(--text-primary)' }}>
                {card.title}
              </h4>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleToggleComplete}
                className="p-1 rounded-md transition-colors"
                style={{ color: card.completed ? 'var(--text-secondary)' : 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <DotsThree className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-40 border z-10 overflow-hidden"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      boxShadow: '0 8px 24px rgba(15, 15, 15, 0.08)',
                      borderRadius: '4px',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkWin(card);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trophy className="w-4 h-4" />
                      Mark as Win
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(card.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Preview */}
          {card.description && (
            <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
              {card.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={badgeVariant} size="sm">
              {cardType?.label || 'Task'}
            </Badge>
            
            {card.dueTime && (
              <div className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                <Clock className="w-3 h-3" />
                {card.dueTime}
              </div>
            )}
            
            {card.notes && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <ChatCircle className="w-3 h-3" />
              </div>
            )}

            {card.isSuggested && (
              <div className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                <Sparkle className="w-3 h-3" />
                AI SUGGESTED
              </div>
            )}

            {card.isSample && (
              <div 
                className="flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded" 
                style={{ 
                  color: 'var(--accent-coral)', 
                  fontSize: '10px',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  border: '1px dashed var(--accent-coral)',
                }}
              >
                SAMPLE
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Task Details"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
            <input
              type="text"
              value={card.title}
              onChange={(e) => onUpdate({ ...card, title: e.target.value })}
              className="w-full px-3 py-2 bg-bg-elevated border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <Textarea
              value={card.description}
              onChange={(e) => onUpdate({ ...card, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Type"
                options={CARD_TYPES}
                value={card.type}
                onChange={(value) => onUpdate({ ...card, type: value as KanbanCardType['type'] })}
                placeholder="Select type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Due Time</label>
              <input
                type="time"
                value={card.dueTime || ''}
                onChange={(e) => onUpdate({ ...card, dueTime: e.target.value })}
                className="w-full px-3 py-2 bg-bg-elevated border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this task..."
              rows={3}
              hint="Use this to capture feedback, outcomes, or any important details"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-primary">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onMarkWin(card);
                setShowDetails(false);
              }}
              icon={<Trophy className="w-4 h-4 text-accent-amber" />}
            >
              Mark as Win
            </Button>
            
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowDetails(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

