import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from '@phosphor-icons/react';
import type { KanbanCard as KanbanCardType, DayOfWeek } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Button, Modal, Input, Textarea, Select } from '../ui';
import { CARD_TYPES } from '../../data/constants';
import { generateId } from '../../utils/helpers';

interface KanbanColumnProps {
  day: DayOfWeek;
  dayLabel: string;
  cards: KanbanCardType[];
  onAddCard: (card: KanbanCardType) => void;
  onUpdateCard: (card: KanbanCardType) => void;
  onDeleteCard: (id: string) => void;
  onMarkWin: (card: KanbanCardType) => void;
  onDropCard: (cardId: string, toDay: DayOfWeek) => void;
  isToday: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  day,
  dayLabel,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMarkWin,
  onDropCard,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    type: 'other' as KanbanCardType['type'],
    dueTime: '',
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      onDropCard(cardId, day);
    }
  };

  const handleAddCard = () => {
    if (!newCard.title.trim()) return;

    onAddCard({
      id: generateId(),
      title: newCard.title,
      description: newCard.description,
      day,
      dueTime: newCard.dueTime || undefined,
      type: newCard.type,
      completed: false,
      isWin: false,
      isSuggested: false,
      notes: '',
      createdAt: new Date().toISOString(),
      project: '',
    });

    setNewCard({ title: '', description: '', type: 'other', dueTime: '' });
    setShowAddModal(false);
  };

  const completedCount = cards.filter(c => c.completed).length;

  return (
    <>
      <div
        className={`
          flex-1 min-w-[240px] flex flex-col
          border transition-all
          ${isDragOver ? 'border-border-subtle' : ''}
        `}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          borderWidth: '1px',
          borderRadius: '5px',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {dayLabel}
            </h3>
            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.05em' }}>
              {completedCount}/{cards.length}
            </span>
          </div>
        </div>

        {/* Cards Container */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-400px)]">
          <AnimatePresence>
            {cards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('cardId', card.id);
                }}
              >
                <KanbanCard
                  card={card}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                  onMarkWin={onMarkWin}
                />
              </div>
            ))}
          </AnimatePresence>

          {cards.length === 0 && (
            <div className="h-full flex items-center justify-center py-12">
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                Drag cards here or click + to add
              </p>
            </div>
          )}
        </div>

        {/* Add Card Button */}
        <div className="p-4 border-t border-border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-2 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-subtle transition-all flex items-center justify-center gap-2 text-sm"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add card</span>
          </button>
        </div>
      </div>

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add task for ${dayLabel}`}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={newCard.title}
            onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
            autoFocus
          />

          <Textarea
            label="Description (optional)"
            placeholder="Add more context..."
            value={newCard.description}
            onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              options={CARD_TYPES.map(t => ({ value: t.value, label: t.label }))}
              value={newCard.type}
              onChange={(value) => setNewCard(prev => ({ ...prev, type: value as KanbanCardType['type'] }))}
            />
            <Input
              label="Due Time (optional)"
              type="time"
              value={newCard.dueTime}
              onChange={(e) => setNewCard(prev => ({ ...prev, dueTime: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddCard}
              disabled={!newCard.title.trim()}
            >
              Add Card
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

