import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  X, 
  CaretRight, 
  CaretLeft, 
  Sparkle,
  CheckCircle
} from '@phosphor-icons/react';
import { Button } from '../ui';
import { useApp } from '../../context/AppContext';
import { saveToStorage } from '../../utils/helpers';

export interface GuideStep {
  id: string;
  page: string;
  target: string; // CSS selector or data attribute
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const GUIDE_STEPS: Record<string, GuideStep[]> = {
  '/app': [
    {
      id: 'week-1',
      page: '/app',
      target: '[data-guide="week-header"]',
      title: 'Welcome to This Week',
      description: 'Plan your week with promotion in mind. Add tasks, organize by day, and track your progress.',
      position: 'bottom',
    },
    {
      id: 'week-2',
      page: '/app',
      target: '[data-guide="quick-capture"]',
      title: 'Quick Capture',
      description: 'Dump your week in natural language and we\'ll automatically parse it into cards. Try it with your actual tasks!',
      position: 'left',
      action: {
        label: 'Try Quick Capture',
        onClick: () => {
          const button = document.querySelector('[data-guide="quick-capture"]') as HTMLElement;
          button?.click();
        },
      },
    },
    {
      id: 'week-3',
      page: '/app',
      target: '[data-guide="plan-with-ai"]',
      title: 'Plan with AI',
      description: 'Generate strategic career moves and sub-tasks based on your week plan. This helps you focus on promotion-worthy work.',
      position: 'left',
    },
    {
      id: 'week-4',
      page: '/app',
      target: '[data-guide="career-moves"]',
      title: 'Career Moves',
      description: 'These are 2-3 strategic actions for the week. Commit to them and mark complete when done. They will automatically become wins.',
      position: 'left',
    },
  ],
  '/app/path': [
    {
      id: 'path-1',
      page: '/app/path',
      target: '[data-guide="path-header"]',
      title: 'Your Promotion Path',
      description: 'Track your progress toward your target promotion. See focus areas, competencies, and milestones.',
      position: 'bottom',
    },
    {
      id: 'path-2',
      page: '/app/path',
      target: '[data-guide="focus-areas"]',
      title: 'Focus Areas',
      description: 'These are the key areas to develop based on your promotion target. Each links to specific competencies.',
      position: 'right',
    },
    {
      id: 'path-3',
      page: '/app/path',
      target: '[data-guide="competencies"]',
      title: 'Competencies',
      description: 'Track your current vs target scores. Wins you log will automatically link to these competencies.',
      position: 'right',
    },
    {
      id: 'path-4',
      page: '/app/path',
      target: '[data-guide="timeline"]',
      title: 'Promotion Timeline',
      description: 'See your milestones and target date. Click any milestone to add it to your week plan.',
      position: 'left',
    },
  ],
  '/app/wins': [
    {
      id: 'wins-1',
      page: '/app/wins',
      target: '[data-guide="wins-header"]',
      title: 'Your Wins Library',
      description: 'Build your proof point library. These wins are formatted in STAR format and ready for performance reviews.',
      position: 'bottom',
    },
    {
      id: 'wins-2',
      page: '/app/wins',
      target: '[data-guide="add-win"]',
      title: 'Add Wins',
      description: 'Capture accomplishments as they happen. We\'ll turn them into STAR-format bullets automatically.',
      position: 'left',
      action: {
        label: 'Add Your First Win',
        onClick: () => {
          const button = document.querySelector('[data-guide="add-win"]') as HTMLElement;
          button?.click();
        },
      },
    },
    {
      id: 'wins-3',
      page: '/app/wins',
      target: '[data-guide="filters"]',
      title: 'Filter & Search',
      description: 'Filter by competency or project. Select multiple wins to export them for reviews or 1:1s.',
      position: 'bottom',
    },
  ],
  '/app/coach': [
    {
      id: 'coach-1',
      page: '/app/coach',
      target: '[data-guide="coach-header"]',
      title: 'Your AI Coach',
      description: 'Get personalized career advice based on your manager canvas, promotion path, and wins. Ask anything!',
      position: 'bottom',
    },
    {
      id: 'coach-2',
      page: '/app/coach',
      target: '[data-guide="suggested-questions"]',
      title: 'Suggested Questions',
      description: 'Start with these common questions, or ask your own. The coach uses your context to give personalized advice.',
      position: 'top',
    },
    {
      id: 'coach-3',
      page: '/app/coach',
      target: '[data-guide="chat-input"]',
      title: 'Chat Input',
      description: 'Type your question here. Press Enter to send. The coach knows about your manager, goals, and progress.',
      position: 'top',
    },
  ],
};

export const GettingStartedGuide: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentPageSteps = GUIDE_STEPS[location.pathname] || [];
  const currentStep = currentPageSteps[currentStepIndex];
  const totalSteps = currentPageSteps.length;

  // Check if guide should be shown
  useEffect(() => {
    if (!state.user?.onboardingCompleted) {
      setIsVisible(false);
      return;
    }

    if (state.user.gettingStartedCompleted) {
      setIsVisible(false);
      return;
    }

    // Check if this page's tour has already been completed
    const completedTours = state.user.completedPageTours || [];
    if (completedTours.includes(location.pathname)) {
      setIsVisible(false);
      return;
    }

    // Show guide if we're on a page with steps that hasn't been completed yet
    if (currentPageSteps.length > 0) {
      setIsVisible(true);
      setCurrentStepIndex(0);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname, state.user, currentPageSteps.length]);

  // Scroll to target element when step changes
  useEffect(() => {
    if (!currentStep || !isVisible) return;

    const timer = setTimeout(() => {
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Mark this page's tour as completed
      markPageTourCompleted(location.pathname);
      setIsVisible(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    // Mark this page's tour as completed when skipping
    markPageTourCompleted(location.pathname);
    setIsVisible(false);
  };

  const markPageTourCompleted = (pagePath: string) => {
    if (state.user) {
      const completedTours = state.user.completedPageTours || [];
      if (!completedTours.includes(pagePath)) {
        const updatedUser = { 
          ...state.user, 
          completedPageTours: [...completedTours, pagePath]
        };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        saveToStorage('user', updatedUser);
      }
    }
  };

  if (!isVisible || !currentStep) return null;

  const targetElement = document.querySelector(currentStep.target);
  const targetRect = targetElement?.getBoundingClientRect();

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const spacing = 16;
    const tooltipWidth = 360;
    const tooltipHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'top':
        top = Math.max(spacing, targetRect.top - tooltipHeight - spacing);
        left = Math.max(spacing, Math.min(
          targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2),
          viewportWidth - tooltipWidth - spacing
        ));
        break;
      case 'bottom':
        top = Math.min(
          targetRect.bottom + spacing,
          viewportHeight - tooltipHeight - spacing
        );
        left = Math.max(spacing, Math.min(
          targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2),
          viewportWidth - tooltipWidth - spacing
        ));
        break;
      case 'left':
        top = Math.max(spacing, Math.min(
          targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2),
          viewportHeight - tooltipHeight - spacing
        ));
        left = Math.max(spacing, targetRect.left - tooltipWidth - spacing);
        break;
      case 'right':
        top = Math.max(spacing, Math.min(
          targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2),
          viewportHeight - tooltipHeight - spacing
        ));
        left = Math.min(
          targetRect.right + spacing,
          viewportWidth - tooltipWidth - spacing
        );
        break;
      case 'center':
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      default:
        return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  const getSpotlightStyle = (): React.CSSProperties => {
    if (!targetRect) return {};
    return {
      position: 'fixed',
      top: `${targetRect.top - 8}px`,
      left: `${targetRect.left - 8}px`,
      width: `${targetRect.width + 16}px`,
      height: `${targetRect.height + 16}px`,
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            onClick={handleSkip}
          />

          {/* Spotlight */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed z-[9999] pointer-events-none"
              style={getSpotlightStyle()}
            >
              <div className="w-full h-full rounded-xl border-4 border-accent-cyan shadow-lg shadow-accent-cyan/50 bg-transparent" />
            </motion.div>
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-[10000] w-[360px]"
            style={getTooltipStyle()}
          >
            <div className="bg-bg-elevated rounded-2xl shadow-2xl border-2 border-accent-cyan/30 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 p-4 border-b border-border-primary">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
                      <Sparkle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm">
                        {currentStep.title}
                      </h3>
                      <p className="text-xs text-text-muted">
                        Step {currentStepIndex + 1} of {totalSteps}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {currentStep.description}
                </p>

                {currentStep.action && (
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        currentStep.action?.onClick();
                        setTimeout(handleNext, 500);
                      }}
                      className="w-full"
                    >
                      {currentStep.action.label}
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Skip tour
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                    icon={<CaretLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNext}
                    icon={currentStepIndex === totalSteps - 1 ? <CheckCircle className="w-4 h-4" /> : <CaretRight className="w-4 h-4" />}
                  >
                    {currentStepIndex === totalSteps - 1 ? 'Complete' : 'Next'}
                  </Button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="px-4 pb-3 flex items-center justify-center gap-1.5">
                {currentPageSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStepIndex
                        ? 'w-6 bg-accent-cyan'
                        : 'w-1.5 bg-border-primary'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

