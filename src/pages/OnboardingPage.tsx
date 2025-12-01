import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Briefcase, 
  MapPin, 
  CaretRight, 
  CaretLeft,
  User,
  Target,
  Medal,
  Calendar,
  Sparkle,
  CheckCircle
} from '@phosphor-icons/react';
import { Button, Input, Select, Card, Slider, Textarea } from '../components/ui';
import { useApp } from '../context/AppContext';
import { 
  CURRENT_LEVELS, 
  FIRM_TYPES, 
  TARGET_LEVELS, 
  PROMOTION_HORIZONS,
  MANAGER_STRESS_OPTIONS,
  MANAGER_PRAISE_OPTIONS,
  MANAGER_STYLE_OPTIONS,
  COMPETENCIES,
  LOCATION_SUGGESTIONS
} from '../data/constants';
import { generateCompetencyExample, parseTimeInput, formatTimeForDisplay } from '../utils/helpers';

const STEPS = [
  { id: 1, title: 'Role & Context', icon: Briefcase, description: 'Tell us about your current position' },
  { id: 2, title: 'Your Manager', icon: User, description: 'Help us understand what matters' },
  { id: 3, title: 'Promotion Target', icon: Target, description: 'Define your goal' },
  { id: 4, title: 'Self-Assessment', icon: Medal, description: 'Rate your competencies' },
  { id: 5, title: 'Weekly Ritual', icon: Calendar, description: 'Set your routine' },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [managerStep, setManagerStep] = useState(1);
  const [competencyStep, setCompetencyStep] = useState(0);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [timeInputValue, setTimeInputValue] = useState<string>('');
  const [timeError, setTimeError] = useState<string>('');

  const { onboarding } = state;

  // Ensure competencyStep is valid when on step 4
  useEffect(() => {
    if (currentStep === 4) {
      if (competencyStep < 0 || competencyStep >= COMPETENCIES.length) {
        setCompetencyStep(0);
      }
    }
  }, [currentStep, competencyStep]);

  // Initialize time input display value when entering step 5
  useEffect(() => {
    if (currentStep === 5 && onboarding.weeklyCheckInTime) {
      setTimeInputValue(formatTimeForDisplay(onboarding.weeklyCheckInTime));
    } else if (currentStep === 5 && !onboarding.weeklyCheckInTime) {
      setTimeInputValue('');
    }
  }, [currentStep, onboarding.weeklyCheckInTime]);

  const updateOnboarding = (data: Partial<typeof onboarding>) => {
    dispatch({ type: 'UPDATE_ONBOARDING', payload: data });
  };

  const handleLocationChange = (value: string) => {
    updateOnboarding({ location: value });
    if (value.length > 1) {
      const filtered = LOCATION_SUGGESTIONS.filter(l => 
        l.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(filtered.length > 0);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location: string) => {
    updateOnboarding({ location, timezone: location });
    setShowLocationSuggestions(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboarding.currentLevel && onboarding.firmType && onboarding.location;
      case 2:
        return onboarding.managerStressTrigger && onboarding.managerPraiseTrigger && onboarding.managerStyle;
      case 3:
        return onboarding.targetLevel && onboarding.promotionHorizon;
      case 4:
        // User must have reached the last competency question to proceed
        return competencyStep >= COMPETENCIES.length - 1 && 
               onboarding.competencyAssessments.every(a => a.score >= 1);
      case 5:
        return onboarding.weeklyCheckInDay && onboarding.weeklyCheckInTime;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 2) setManagerStep(1);
      if (currentStep === 3) setCompetencyStep(0);
    } else {
      dispatch({ type: 'COMPLETE_ONBOARDING' });
      navigate('/app');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      if (currentStep === 4 && competencyStep > 0) {
        setCompetencyStep(competencyStep - 1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const generateExample = (competencyId: string) => {
    const example = generateCompetencyExample(competencyId, onboarding.firmType || 'big4');
    dispatch({
      type: 'UPDATE_COMPETENCY_ASSESSMENT',
      payload: {
        competencyId,
        score: onboarding.competencyAssessments.find(a => a.competencyId === competencyId)?.score || 3,
        example,
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Let's set your context</h2>
              <p className="text-text-secondary">
                This helps us tailor advice to your specific situation and firm type.
              </p>
            </div>

            <Select
              label="Your current level"
              options={CURRENT_LEVELS}
              value={onboarding.currentLevel || ''}
              onChange={(value) => updateOnboarding({ currentLevel: value as typeof onboarding.currentLevel })}
              placeholder="Select your level"
            />

            <Select
              label="Your firm type"
              options={FIRM_TYPES}
              value={onboarding.firmType || ''}
              onChange={(value) => updateOnboarding({ firmType: value as typeof onboarding.firmType })}
              placeholder="Select firm type"
            />

            <div className="relative">
              <Input
                label="Location"
                placeholder="Start typing your city..."
                icon={<MapPin className="w-5 h-5" />}
                value={onboarding.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => onboarding.location.length > 1 && setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                hint="This helps us determine your timezone"
              />
              {showLocationSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-bg-elevated border border-border-primary rounded-lg shadow-xl overflow-hidden">
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full px-4 py-3 text-left text-text-primary hover:bg-bg-hover transition-colors"
                      onClick={() => selectLocation(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Understanding your manager</h2>
              <p className="text-text-secondary">
                These questions help us calibrate what your manager likely cares about most.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {managerStep === 1 && (
                <motion.div
                  key="stress"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-lg text-text-primary font-medium">
                    When your manager is stressed, it's usually because of...
                  </p>
                  <div className="space-y-3">
                    {MANAGER_STRESS_OPTIONS.map((option) => (
                      <Card
                        key={option.value}
                        hover
                        padding="md"
                        className={`cursor-pointer transition-all ${
                          onboarding.managerStressTrigger === option.value
                            ? 'border-accent-blue bg-accent-blue/5'
                            : ''
                        }`}
                        onClick={() => {
                          updateOnboarding({ managerStressTrigger: option.value as typeof onboarding.managerStressTrigger });
                          setTimeout(() => setManagerStep(2), 300);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            onboarding.managerStressTrigger === option.value
                              ? 'border-accent-blue bg-accent-blue'
                              : 'border-border-secondary'
                          }`}>
                            {onboarding.managerStressTrigger === option.value && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-text-primary">{option.label}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {managerStep === 2 && (
                <motion.div
                  key="praise"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setManagerStep(1)}
                    className="text-sm text-text-muted hover:text-text-secondary flex items-center gap-1"
                  >
                    <CaretLeft className="w-4 h-4" /> Previous question
                  </button>
                  <p className="text-lg text-text-primary font-medium">
                    What gets you the most praise from your manager?
                  </p>
                  <div className="space-y-3">
                    {MANAGER_PRAISE_OPTIONS.map((option) => (
                      <Card
                        key={option.value}
                        hover
                        padding="md"
                        className={`cursor-pointer transition-all ${
                          onboarding.managerPraiseTrigger === option.value
                            ? 'border-accent-blue bg-accent-blue/5'
                            : ''
                        }`}
                        onClick={() => {
                          updateOnboarding({ managerPraiseTrigger: option.value as typeof onboarding.managerPraiseTrigger });
                          setTimeout(() => setManagerStep(3), 300);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            onboarding.managerPraiseTrigger === option.value
                              ? 'border-accent-blue bg-accent-blue'
                              : 'border-border-secondary'
                          }`}>
                            {onboarding.managerPraiseTrigger === option.value && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-text-primary">{option.label}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {managerStep === 3 && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setManagerStep(2)}
                    className="text-sm text-text-muted hover:text-text-secondary flex items-center gap-1"
                  >
                    <CaretLeft className="w-4 h-4" /> Previous question
                  </button>
                  <p className="text-lg text-text-primary font-medium">
                    Which feels closest to your manager's style?
                  </p>
                  <div className="space-y-3">
                    {MANAGER_STYLE_OPTIONS.map((option) => (
                      <Card
                        key={option.value}
                        hover
                        padding="md"
                        className={`cursor-pointer transition-all ${
                          onboarding.managerStyle === option.value
                            ? 'border-accent-blue bg-accent-blue/5'
                            : ''
                        }`}
                        onClick={() => updateOnboarding({ managerStyle: option.value as typeof onboarding.managerStyle })}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            onboarding.managerStyle === option.value
                              ? 'border-accent-blue bg-accent-blue'
                              : 'border-border-secondary'
                          }`}>
                            {onboarding.managerStyle === option.value && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <span className="text-text-primary font-medium">{option.label}</span>
                            <p className="text-sm text-text-muted">{option.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Your next promotion</h2>
              <p className="text-text-secondary">
                This defines your promotion horizon and helps us plan milestones.
              </p>
            </div>

            <Select
              label="Your target next role"
              options={TARGET_LEVELS}
              value={onboarding.targetLevel || ''}
              onChange={(value) => updateOnboarding({ targetLevel: value as typeof onboarding.targetLevel })}
              placeholder="Select target role"
            />

            <Select
              label="When do you realistically aim to be ready?"
              options={PROMOTION_HORIZONS}
              value={onboarding.promotionHorizon || ''}
              onChange={(value) => updateOnboarding({ promotionHorizon: value as typeof onboarding.promotionHorizon })}
              placeholder="Select timeframe"
            />

            <div className="bg-bg-tertiary rounded-xl p-4 border border-border-primary">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-amber/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-accent-amber" />
                </div>
                <div>
                  <p className="text-sm text-text-primary font-medium">Why this matters</p>
                  <p className="text-sm text-text-muted mt-1">
                    Your promotion timeline shapes which milestones we prioritize and what actions we suggest each week.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        const currentCompetency = COMPETENCIES[competencyStep];
        const assessment = onboarding.competencyAssessments.find(
          a => a.competencyId === currentCompetency?.id
        );
        const isLastCompetency = competencyStep === COMPETENCIES.length - 1;
        
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-text-primary">How are you doing today?</h2>
              <p className="text-text-secondary">
                Rate yourself honestly on each competency. This helps us identify focus areas.
              </p>
              <p className="text-sm text-text-muted mt-2">
                Question {competencyStep + 1} of {COMPETENCIES.length}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {currentCompetency && (
                <motion.div
                  key={currentCompetency.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {competencyStep > 0 && (
                    <button 
                      onClick={() => setCompetencyStep(competencyStep - 1)}
                      className="text-sm text-text-muted hover:text-text-secondary flex items-center gap-1"
                    >
                      <CaretLeft className="w-4 h-4" /> Previous question
                    </button>
                  )}
                  
                  <Card padding="md" className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{currentCompetency.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">{currentCompetency.name}</h3>
                        <p className="text-sm text-text-muted mt-0.5">{currentCompetency.levelDescription}</p>
                      </div>
                    </div>

                    <Slider
                      value={assessment?.score || 3}
                      onChange={(score) => {
                        dispatch({
                          type: 'UPDATE_COMPETENCY_ASSESSMENT',
                          payload: { competencyId: currentCompetency.id, score, example: assessment?.example || '' }
                        });
                        // Auto-advance to next question after rating
                        if (!isLastCompetency && competencyStep < COMPETENCIES.length - 1) {
                          setTimeout(() => setCompetencyStep(competencyStep + 1), 300);
                        }
                      }}
                      min={1}
                      max={5}
                      label="How consistently do you show this?"
                      labels={['Rarely', 'Sometimes', 'Often', 'Usually', 'Always']}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-text-secondary">
                          One example from the last 3 months (optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => generateExample(currentCompetency.id)}
                          className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
                        >
                          <Sparkle className="w-3 h-3" />
                          Suggest example
                        </button>
                      </div>
                      <Textarea
                        value={assessment?.example || ''}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_COMPETENCY_ASSESSMENT',
                          payload: { 
                            competencyId: currentCompetency.id, 
                            score: assessment?.score || 3, 
                            example: e.target.value 
                          }
                        })}
                        placeholder="Describe a specific situation..."
                        rows={2}
                        maxLength={200}
                      />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-text-primary">How Rocketmentor fits into your week</h2>
              <p className="text-text-secondary">
                A simple weekly ritual to keep you on track for promotion.
              </p>
            </div>

            <Card padding="lg" className="space-y-4">
              <h3 className="font-semibold text-text-primary">Each week, you will:</h3>
              <ul className="space-y-3">
                {[
                  'Use the Kanban board (Mon-Fri) to capture important work and deadlines',
                  'Let Rocketmentor propose structured sub-steps and 2-3 "career moves"',
                  'Capture wins in a few clicks',
                  'Do a quick weekly review to turn work into proof points'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Preferred day for weekly check-in"
                options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => ({ value: d, label: d }))}
                value={onboarding.weeklyCheckInDay}
                onChange={(value) => updateOnboarding({ weeklyCheckInDay: value })}
              />
              <Input
                label="Preferred time"
                type="text"
                placeholder="8:30 AM"
                value={timeInputValue}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setTimeInputValue(inputValue);
                  setTimeError(''); // Clear error while typing
                  
                  if (!inputValue.trim()) {
                    updateOnboarding({ weeklyCheckInTime: '' });
                    return;
                  }
                  
                  // Try to parse, but don't update display value while typing
                  const parsedTime = parseTimeInput(inputValue);
                  if (parsedTime) {
                    updateOnboarding({ weeklyCheckInTime: parsedTime });
                  }
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value.trim();
                  if (!inputValue) {
                    setTimeError('');
                    updateOnboarding({ weeklyCheckInTime: '' });
                    setTimeInputValue('');
                    return;
                  }
                  
                  const parsedTime = parseTimeInput(inputValue);
                  if (parsedTime) {
                    setTimeError('');
                    updateOnboarding({ weeklyCheckInTime: parsedTime });
                    // Format display value on blur
                    setTimeInputValue(formatTimeForDisplay(parsedTime));
                  } else {
                    setTimeError('Please enter a valid time (e.g., 8:30 AM or 08:30)');
                  }
                }}
                error={timeError}
                hint="Type the time (e.g., 8:30 AM or 08:30)"
              />
            </div>

            <div className="bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 rounded-xl p-4 border border-accent-blue/20">
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-text-primary font-medium">You're all set!</p>
                  <p className="text-sm text-text-muted mt-1">
                    Click "Start my first week" to begin planning with promotion in mind.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">rocketmentor</span>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all
                        ${isActive 
                          ? 'bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/20' 
                          : isComplete 
                            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                            : 'bg-bg-elevated text-text-muted border border-border-primary'
                        }
                      `}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block ${isActive ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isComplete ? 'bg-accent-green' : 'bg-border-primary'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-sm text-text-muted text-center">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Content */}
        <Card padding="lg" className="bg-bg-secondary/50 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-primary">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              icon={<CaretLeft className="w-4 h-4" />}
            >
              Back
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              icon={<CaretRight className="w-4 h-4" />}
            >
              {currentStep === 5 ? 'Start my first week' : 'Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

