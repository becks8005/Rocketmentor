import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkle, 
  Calendar, 
  ClipboardText, 
  Rocket,
  CaretRight,
  MagicWand,
  Play,
  CheckCircle,
  WarningCircle
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { CareerMoveCard } from '../components/kanban/CareerMoveCard';
import { Button, Card, Modal, Textarea } from '../components/ui';
import type { KanbanCard, DayOfWeek, WeekPlan, CareerMove } from '../types';
import { 
  generateId, 
  getCurrentWeekStart, 
  parseWeekDump, 
  generateCareerMoves,
  generateSubTasks
} from '../utils/helpers';
import { DAYS_OF_WEEK } from '../data/constants';

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'monday', // Sunday maps to monday for display purposes
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'friday', // Saturday maps to friday
};

// Sample cards to show when kanban is empty
const SAMPLE_CARDS: KanbanCard[] = [
  {
    id: 'sample-1',
    title: 'Example task (user-added type): Send final proposal to client on Friday',
    description: '',
    day: 'friday',
    type: 'deliverable',
    completed: false,
    isWin: false,
    isSuggested: false,
    isSample: true,
    notes: '',
    createdAt: new Date().toISOString(),
    project: '',
  },
  {
    id: 'sample-2',
    title: 'Example task (AI assist example): Prepare draft and send to manager on Wednesday',
    description: '',
    day: 'wednesday',
    type: 'deliverable',
    completed: false,
    isWin: false,
    isSuggested: true,
    isSample: true,
    notes: '',
    createdAt: new Date().toISOString(),
    project: '',
  },
];

export const ThisWeekPage: React.FC = () => {
  const { state, dispatch, getCurrentWeekPlan, createWeekPlan } = useApp();
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showNoTasksTooltip, setShowNoTasksTooltip] = useState(false);
  const generateButtonRef = useRef<HTMLDivElement>(null);

  const today = new Date().getDay();
  const todayKey = DAY_MAP[today];
  
  // Check if we should show sample cards (no real cards exist)
  const realCards = weekPlan?.cards.filter(c => !c.isSample) || [];
  const showSampleCards = realCards.length === 0;

  useEffect(() => {
    let plan = getCurrentWeekPlan();
    if (!plan) {
      plan = createWeekPlan();
    }
    setWeekPlan(plan);
  }, []);

  const handleAddCard = (card: KanbanCard) => {
    if (!weekPlan) return;
    dispatch({ type: 'ADD_CARD', payload: { weekId: weekPlan.id, card } });
    setWeekPlan(prev => prev ? { ...prev, cards: [...prev.cards, card] } : null);
  };

  const handleUpdateCard = (card: KanbanCard) => {
    if (!weekPlan) return;
    dispatch({ type: 'UPDATE_CARD', payload: { weekId: weekPlan.id, card } });
    setWeekPlan(prev => prev ? { 
      ...prev, 
      cards: prev.cards.map(c => c.id === card.id ? card : c) 
    } : null);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!weekPlan) return;
    dispatch({ type: 'DELETE_CARD', payload: { weekId: weekPlan.id, cardId } });
    setWeekPlan(prev => prev ? { 
      ...prev, 
      cards: prev.cards.filter(c => c.id !== cardId) 
    } : null);
  };

  const handleDropCard = (cardId: string, toDay: DayOfWeek) => {
    if (!weekPlan) return;
    const card = weekPlan.cards.find(c => c.id === cardId);
    if (card && card.day !== toDay) {
      handleUpdateCard({ ...card, day: toDay });
    }
  };

  const handleMarkWin = (card: KanbanCard) => {
    dispatch({
      type: 'ADD_WIN',
      payload: {
        id: generateId(),
        title: card.title,
        description: `Completed: ${card.description || card.title}`,
        project: card.project,
        competencyTags: [],
        date: new Date().toISOString(),
        weekId: weekPlan?.id,
        sourceType: 'kanban',
        sourceId: card.id,
      }
    });
    handleUpdateCard({ ...card, isWin: true, completed: true });
  };

  const handleAIHelp = async () => {
    if (!aiInput.trim() || !weekPlan) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const parsedCards = parseWeekDump(aiInput);
    
    parsedCards.forEach((cardData) => {
      const card: KanbanCard = {
        id: generateId(),
        title: cardData.title || '',
        description: cardData.description || '',
        day: cardData.day || 'monday',
        type: cardData.type || 'other',
        completed: false,
        isWin: false,
        isSuggested: false,
        notes: '',
        createdAt: new Date().toISOString(),
        project: '',
      };
      handleAddCard(card);
    });
    
    setAiInput('');
    setShowAIHelper(false);
    setIsGenerating(false);
  };

  const handleGeneratePlan = async () => {
    // Show tooltip if no real tasks exist
    if (!weekPlan || realCards.length === 0) {
      setShowNoTasksTooltip(true);
      setTimeout(() => setShowNoTasksTooltip(false), 3000);
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate sub-tasks for existing cards
    const existingCards = weekPlan.cards.filter(c => !c.isSuggested);
    const suggestions: KanbanCard[] = [];
    
    existingCards.forEach((card) => {
      const subTasks = generateSubTasks(card);
      subTasks.forEach((task, index) => {
        const dayOffset = Math.floor(index / 2);
        const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const cardDayIndex = days.indexOf(card.day);
        const targetDay = days[Math.max(0, cardDayIndex - dayOffset - 1)] || card.day;
        
        suggestions.push({
          id: generateId(),
          title: task.title || '',
          description: '',
          day: targetDay,
          type: task.type || 'other',
          completed: false,
          isWin: false,
          isSuggested: true,
          notes: '',
          createdAt: new Date().toISOString(),
          project: card.project,
        });
      });
    });
    
    // Add suggestions
    suggestions.forEach(card => handleAddCard(card));
    
    // Generate career moves
    const moves = generateCareerMoves(
      weekPlan.cards, 
      state.managerCanvas, 
      state.promotionPath?.focusAreas || []
    );
    
    const updatedPlan = {
      ...weekPlan,
      careerMoves: moves,
    };
    
    dispatch({ type: 'UPDATE_WEEK_PLAN', payload: updatedPlan });
    setWeekPlan(updatedPlan);
    
    setIsGenerating(false);
  };

  const handleCommitMove = (moveId: string) => {
    if (!weekPlan) return;
    const move = weekPlan.careerMoves.find(m => m.id === moveId);
    if (move) {
      const updatedMove = { ...move, committed: true };
      dispatch({ type: 'UPDATE_CAREER_MOVE', payload: { weekId: weekPlan.id, move: updatedMove } });
      setWeekPlan(prev => prev ? {
        ...prev,
        careerMoves: prev.careerMoves.map(m => m.id === moveId ? updatedMove : m)
      } : null);
    }
  };

  const handleCompleteMove = (moveId: string) => {
    if (!weekPlan) return;
    const move = weekPlan.careerMoves.find(m => m.id === moveId);
    if (move) {
      const updatedMove = { ...move, completed: true };
      dispatch({ type: 'UPDATE_CAREER_MOVE', payload: { weekId: weekPlan.id, move: updatedMove } });
      setWeekPlan(prev => prev ? {
        ...prev,
        careerMoves: prev.careerMoves.map(m => m.id === moveId ? updatedMove : m)
      } : null);
      
      // Also create a win
      dispatch({
        type: 'ADD_WIN',
        payload: {
          id: generateId(),
          title: move.title,
          description: move.description,
          competencyTags: move.linkedCompetencies,
          date: new Date().toISOString(),
          weekId: weekPlan.id,
          sourceType: 'move',
          sourceId: move.id,
        }
      });
    }
  };

  const handleRegenerateMove = (moveId: string) => {
    // In real implementation, would regenerate the move
    console.log('Regenerate move:', moveId);
  };

  const getCardsForDay = (day: DayOfWeek): KanbanCard[] => {
    const realCardsForDay = weekPlan?.cards.filter(c => c.day === day && !c.isSample) || [];
    
    // If no real cards exist anywhere, show sample cards
    if (showSampleCards) {
      const sampleCardsForDay = SAMPLE_CARDS.filter(c => c.day === day);
      return sampleCardsForDay;
    }
    
    return realCardsForDay;
  };

  const completedCards = realCards.filter(c => c.completed).length;
  const totalCards = realCards.length;
  const committedMoves = weekPlan?.careerMoves.filter(m => m.committed).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-guide="week-header">
        <h1 className="text-2xl font-semibold flex items-center gap-3 mb-2" style={{ color: 'var(--text-primary)', fontSize: '24px' }}>
          This Week
        </h1>
        <p className="text-sm max-w-[420px] md:max-w-lg lg:max-w-xl" style={{ color: 'var(--text-secondary)' }}>
          Add your key deliverables and deadlines. The AI will think like a senior consultant and break them into actionable steps with realistic timelines.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-0">
        {/* Kanban Board */}
        <div className="xl:col-span-3 xl:pr-8">
          {/* Stats and Quick Capture row - inside kanban section */}
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-center gap-4 font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              <span>{completedCards}/{totalCards} TASKS</span>
              <span>·</span>
              <span>{committedMoves} CAREER MOVES COMMITTED</span>
            </div>
            <div data-guide="quick-capture">
              <Button
                variant="secondary"
                onClick={() => setShowAIHelper(true)}
                icon={<MagicWand className="w-4 h-4" />}
              >
                Quick Capture
              </Button>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4">
            {DAYS_OF_WEEK.map((dayLabel, index) => {
              const day = dayLabel.toLowerCase() as DayOfWeek;
              return (
                <KanbanColumn
                  key={day}
                  day={day}
                  dayLabel={dayLabel}
                  cards={getCardsForDay(day)}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                  onMarkWin={handleMarkWin}
                  onDropCard={handleDropCard}
                  isToday={day === todayKey}
                />
              );
            })}
          </div>
        </div>

        {/* Career Moves Panel - with vertical divider */}
        <div 
          className="xl:col-span-1 xl:pl-8 relative" 
          data-guide="career-moves"
          style={{ minHeight: 'calc(100vh - 65px - 80px)' }} // Ensure minimum height for divider
        >
          {/* Vertical divider - extends from horizontal header divider to bottom of viewport */}
          <div 
            className="hidden xl:block absolute left-0 w-px"
            style={{ 
              backgroundColor: 'var(--border-subtle)',
              top: -200, // Extend up through header section + gap + padding to meet horizontal divider
              bottom: -40 // Extend down through padding to bottom
            }}
          />
          <Card padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-border-subtle relative" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--accent-soft-peach)' }} />
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Career Moves</h3>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.05em' }}>
                  2 TO 3 STRATEGIC ACTIONS THIS WEEK
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {weekPlan?.careerMoves && weekPlan.careerMoves.length > 0 ? (
                <>
                  {weekPlan.careerMoves.map((move) => (
                    <CareerMoveCard
                      key={move.id}
                      move={move}
                      onCommit={handleCommitMove}
                      onComplete={handleCompleteMove}
                      onRegenerate={handleRegenerateMove}
                    />
                  ))}
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      onClick={handleGeneratePlan}
                      isLoading={isGenerating}
                      icon={<Sparkle className="w-4 h-4" />}
                      className="w-full"
                    >
                      Regenerate Career Moves
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Sparkle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Add tasks to your week, then generate strategic career moves
                  </p>
                  <div ref={generateButtonRef} className="relative" data-guide="plan-with-ai">
                    <Button
                      variant="primary"
                      onClick={handleGeneratePlan}
                      isLoading={isGenerating}
                      icon={<Sparkle className="w-4 h-4" />}
                      className="w-full"
                    >
                      Generate Career Moves
                    </Button>
                    
                    {/* Tooltip when no tasks */}
                    <AnimatePresence>
                      {showNoTasksTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 right-0 top-full mt-2 p-3 rounded-lg z-10"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 8px 24px rgba(15, 15, 15, 0.12)',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <WarningCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-coral)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Add tasks first to generate strategic career moves.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* AI Helper Modal */}
      <Modal
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
        title="Quick Capture Your Week"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Dump your week in natural language. We'll parse it into cards automatically.
          </p>
          
          <Textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Mon: workshop dry run, review proposal deck
Tue: first draft of analysis, manager sync
Wed: incorporate feedback
Thu: fix numbers, quality check
Fri: send final proposal to client"
            rows={6}
          />

          <div className="bg-bg-tertiary rounded-lg p-3">
            <p className="text-xs text-text-muted">
              <strong>Tip:</strong> Include day prefixes (Mon, Tue, etc.) for best results. 
              Generic descriptions are fine, no confidential details needed.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAIHelper(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAIHelp}
              isLoading={isGenerating}
              icon={<Sparkle className="w-4 h-4" />}
            >
              Parse & Create Cards
            </Button>
          </div>
        </div>
      </Modal>

      {/* Weekly Review Modal */}
      <Modal
        isOpen={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        title="Weekly Review"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">
            Review your week and capture your wins. We'll turn completed work into proof points.
          </p>

          {/* Career Moves Review */}
          {weekPlan?.careerMoves.filter(m => m.committed).map((move) => (
            <div key={move.id} className="p-4 bg-bg-tertiary rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium text-text-primary">{move.title}</h4>
                  <p className="text-sm text-text-muted mt-1">{move.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {move.completed ? (
                    <span className="text-sm text-accent-green flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Done
                    </span>
                  ) : (
                    <select className="px-3 py-1.5 text-sm bg-bg-elevated border border-border-primary rounded-lg text-text-primary">
                      <option>Completed</option>
                      <option>Partially done</option>
                      <option>Not done</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Completed Tasks Summary */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Completed Tasks</h4>
            <div className="space-y-2">
              {weekPlan?.cards.filter(c => c.completed).map((card) => (
                <div key={card.id} className="flex items-center gap-3 p-2 bg-bg-tertiary rounded-lg">
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                  <span className="text-sm text-text-primary">{card.title}</span>
                </div>
              ))}
              {weekPlan?.cards.filter(c => c.completed).length === 0 && (
                <p className="text-sm text-text-muted">No completed tasks yet</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowWeeklyReview(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setShowWeeklyReview(false)}>
              Complete Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

