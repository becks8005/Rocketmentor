import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Path as PathIcon, 
  Target, 
  TrendUp, 
  TrendDown, 
  Minus,
  Calendar,
  CheckCircle,
  CaretRight,
  Medal,
  Sparkle,
  ChartBar,
  MapPin,
  Warning,
  Brain,
  Lightning,
  UsersThree,
  Chat,
  Lightbulb
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Progress, Modal } from '../components/ui';
import { COMPETENCIES } from '../data/constants';
import { formatDate } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export const PathPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const { promotionPath, wins, onboarding } = state;

  // Helper function to format level names
  const formatLevelName = (level: string) => {
    return level.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Helper function to get level number
  const getLevelNumber = (level: string): number => {
    const levelMap: { [key: string]: number } = {
      'business_analyst': 1,
      'junior_consultant': 2,
      'associate': 3,
      'consultant': 4,
      'senior_consultant': 5,
      'manager': 6,
      'senior_manager': 7
    };
    return levelMap[level] || 0;
  };

  if (!promotionPath) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card padding="lg" className="text-center max-w-md">
          <PathIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No Promotion Path Set</h2>
          <p className="text-text-secondary mb-4">
            Complete onboarding to set up your promotion path
          </p>
          <Button variant="primary" onClick={() => navigate('/onboarding')}>
            Start Onboarding
          </Button>
        </Card>
      </div>
    );
  }

  const targetDate = new Date(promotionPath.targetDate);
  const now = new Date();
  const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const monthsUntilTarget = Math.ceil(daysUntilTarget / 30);

  const getMomentumIcon = (momentum: 'increasing' | 'stable' | 'decreasing') => {
    switch (momentum) {
      case 'increasing':
        return <TrendUp className="w-4 h-4 text-accent-green" />;
      case 'decreasing':
        return <TrendDown className="w-4 h-4 text-accent-rose" />;
      default:
        return <Minus className="w-4 h-4 text-text-muted" />;
    }
  };

  const getCompetencyIcon = (emojiIcon: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      '🧩': <Brain className="w-5 h-5 text-accent-blue" />,
      '🎯': <Target className="w-5 h-5 text-accent-blue" />,
      '⚡': <Lightning className="w-5 h-5 text-accent-blue" />,
      '🤝': <UsersThree className="w-5 h-5 text-accent-blue" />,
      '📝': <Chat className="w-5 h-5 text-accent-blue" />,
      '💡': <Lightbulb className="w-5 h-5 text-accent-blue" />,
    };
    return iconMap[emojiIcon] || <Sparkle className="w-5 h-5 text-accent-blue" />;
  };

  const handleToggleMilestone = (milestoneId: string) => {
    dispatch({ type: 'TOGGLE_MILESTONE', payload: milestoneId });
  };

  const handleAddToWeek = (milestoneTitle: string) => {
    // Navigate to This Week with a pre-filled task
    navigate('/app', { state: { addTask: milestoneTitle } });
  };

  const completedMilestones = promotionPath.milestones.filter(m => m.completed).length;
  const totalMilestones = promotionPath.milestones.length;

  const selectedMilestoneData = promotionPath.milestones.find(m => m.id === selectedMilestone);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-bg-app pb-6 space-y-6">
        {/* Header */}
        <div data-guide="path-header">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <PathIcon className="w-7 h-7 text-accent-purple" />
            Promotion Path
          </h1>
          <p className="text-text-secondary mt-1 max-w-[420px] md:max-w-lg lg:max-w-xl">
            See how you're tracking against {promotionPath.targetLevel.replace('_', ' ')}. Focus areas and competencies update as you log wins and complete milestones.
          </p>
        </div>

        {/* SECTION 1: Your Stage - Full Width */}
        <Card padding="none" className="bg-gray-50 shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sub-Container 1 - Current Stage */}
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-normal uppercase tracking-wider mb-2">
                  Current Stage
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {onboarding.currentLevel ? formatLevelName(onboarding.currentLevel) : 'Not Set'}
                  </h2>
                  {onboarding.currentLevel && (
                    <Badge 
                      variant="blue" 
                      size="sm"
                      className="px-2.5 py-1 text-xs font-medium"
                    >
                      Level {getLevelNumber(onboarding.currentLevel)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Sub-Container 2 - Target Promotion */}
              <div className="flex flex-col justify-center md:border-l md:border-r border-gray-200 md:px-8">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-normal mb-1">
                      Target Promotion
                    </p>
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                      {formatLevelName(promotionPath.targetLevel)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(promotionPath.targetDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Container 3 - Stats */}
              <div className="flex items-center justify-center gap-6">
                {/* Stat 1 - Months to Go */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800 leading-none">
                    {monthsUntilTarget}
                  </p>
                  <p className="text-xs text-gray-500 font-normal mt-2 uppercase tracking-wide">
                    months to go
                  </p>
                </div>

                {/* Divider */}
                <div className="h-16 w-px bg-gray-200" />

                {/* Stat 2 - Milestones */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800 leading-none">
                    {completedMilestones}/{totalMilestones}
                  </p>
                  <p className="text-xs text-gray-500 font-normal mt-2 uppercase tracking-wide">
                    milestones
                  </p>
                </div>

                {/* Divider */}
                <div className="h-16 w-px bg-gray-200" />

                {/* Stat 3 - Wins Logged */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800 leading-none">
                    {wins.length}
                  </p>
                  <p className="text-xs text-gray-500 font-normal mt-2 uppercase tracking-wide">
                    wins logged
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content - Split View with Independent Scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-65px-200px-2.5rem)] lg:overflow-hidden">
        {/* SECTION 2: Skill Profile - Left Column */}
        <div className="lg:overflow-y-auto lg:pr-2 scrollable-column">
          <Card padding="lg">
            {/* CONTAINER HEADER */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <ChartBar className="w-5 h-5 text-accent-blue" />
                <h2 className="text-xl font-bold text-gray-900">Skill Profile</h2>
              </div>
              <p className="text-sm text-gray-500">
                These capabilities drive your promotion readiness.
              </p>
              <div className="h-px bg-gray-200 mt-4 mb-6" />
            </div>

            {/* SUB-SECTION 1: Focus Areas */}
            <div data-guide="focus-areas" className="mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-base font-semibold text-gray-700">Focus Areas</h3>
                </div>

                <div className="space-y-3">
                  {promotionPath.focusAreas.map((focus, index) => (
                    <motion.div
                      key={focus.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow border-l-4 border-l-accent-cyan"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 flex items-center justify-center flex-shrink-0">
                          <Sparkle className="w-4 h-4 text-accent-cyan" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900">{focus.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{focus.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {focus.linkedCompetencies.map((compId) => {
                              const comp = COMPETENCIES.find(c => c.id === compId);
                              return (
                                <Badge 
                                  key={compId} 
                                  variant="blue" 
                                  size="sm"
                                  className="text-[10px] uppercase rounded-full px-2.5 py-1"
                                >
                                  {comp?.name || compId}
                                </Badge>
                              );
                            })}
                          </div>

                          {focus.examples.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-2">Your examples:</p>
                              <ul className="space-y-1">
                                {focus.examples.map((ex, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-accent-green mt-1 flex-shrink-0" />
                                    {ex}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* SUB-SECTION 2: Competencies */}
            <div data-guide="competencies">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-accent-amber" />
                    <h3 className="text-base font-semibold text-gray-700">Competencies</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Re-assess
                  </Button>
                </div>

                <div className="space-y-3">
                  {promotionPath.competencies.map((comp) => {
                    const competency = COMPETENCIES.find(c => c.id === comp.competencyId);
                    if (!competency) return null;

                    const winsForComp = wins.filter(w => 
                      w.competencyTags.includes(comp.competencyId)
                    ).length;

                    return (
                      <div 
                        key={comp.competencyId} 
                        className="p-4 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getCompetencyIcon(competency.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {competency.name}
                              </h4>
                              {getMomentumIcon(comp.momentum)}
                            </div>
                            
                            <div className="mt-2">
                              <Progress 
                                value={comp.currentScore} 
                                max={5} 
                                size="sm"
                              />
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs font-medium text-accent-blue">
                                  Current: {comp.currentScore}/5
                                </span>
                                <span className="text-xs text-gray-500">
                                  Target: {comp.targetScore}/5
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{winsForComp} wins logged</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* SECTION 3: Road to Promotion - Right Column */}
        <div className="lg:overflow-y-auto lg:pl-2 scrollable-column">
          <Card padding="lg" data-guide="timeline">
            {/* CONTAINER HEADER */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-accent-blue" />
                <h2 className="text-xl font-bold text-gray-900">Road to Promotion</h2>
                <Badge variant="blue" size="sm" className="ml-2">
                  {formatDate(promotionPath.targetDate)}
                </Badge>
              </div>
              <div className="h-px bg-gray-200 mt-4 mb-6" />
            </div>

          <div className="space-y-8">
            {/* Upcoming Milestones */}
            {(() => {
              const upcomingMilestones = promotionPath.milestones.filter(m => {
                const isPast = new Date(m.targetDate) < now;
                return !m.completed && !isPast;
              });
              
              if (upcomingMilestones.length === 0) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-gray-700">Upcoming</h3>
                    <Badge variant="default" size="sm" className="text-xs">
                      {upcomingMilestones.length} {upcomingMilestones.length === 1 ? 'milestone' : 'milestones'}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {upcomingMilestones.map((milestone, index) => {
                      const categoryColor = 
                        milestone.category === 'preparation' ? 'blue' :
                        milestone.category === 'visibility' ? 'amber' :
                        milestone.category === 'relationship' ? 'purple' :
                        milestone.category === 'execution' ? 'green' :
                        'blue';
                      
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Content */}
                          <div
                            onClick={() => setSelectedMilestone(milestone.id)}
                            className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            {/* TOP ROW - Category Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={categoryColor as any}
                                size="sm"
                                className="text-[10px] uppercase font-medium"
                              >
                                {milestone.category}
                              </Badge>
                            </div>

                            {/* MIDDLE - Title and Description */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900 mb-1">
                                  {milestone.title}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {milestone.description}
                                </p>
                              </div>
                              <CaretRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                            </div>

                            {/* BOTTOM ROW - Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(milestone.targetDate)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* At Risk Milestones */}
              {(() => {
              const atRiskMilestones = promotionPath.milestones.filter(m => {
                const isPast = new Date(m.targetDate) < now;
                return !m.completed && isPast;
              });
              
              if (atRiskMilestones.length === 0) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Warning className="w-4 h-4 text-red-600" />
                    <h3 className="text-base font-semibold text-red-600">At Risk</h3>
                    <Badge variant="rose" size="sm" className="bg-red-600 text-white border-0">
                      Overdue
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {atRiskMilestones.map((milestone, index) => {
                      const categoryColor = 
                        milestone.category === 'preparation' ? 'blue' :
                        milestone.category === 'visibility' ? 'amber' :
                        milestone.category === 'relationship' ? 'purple' :
                        milestone.category === 'execution' ? 'green' :
                        'blue';
                      
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Content */}
                          <div
                            onClick={() => setSelectedMilestone(milestone.id)}
                            className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-lg cursor-pointer transition-all hover:scale-[1.01] border-l-4 border-l-orange-500"
                          >
                            {/* TOP ROW - Category Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={categoryColor as any}
                                size="sm"
                                className="text-[10px] uppercase font-medium"
                              >
                                {milestone.category}
                              </Badge>
                            </div>

                            {/* MIDDLE - Title and Description */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900 mb-1">
                                  {milestone.title}
                                </h4>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {milestone.description}
                                </p>
                              </div>
                              <CaretRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                            </div>

                            {/* BOTTOM ROW - Date */}
                            <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                              <Calendar className="w-4 h-4" />
                              {formatDate(milestone.targetDate)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Completed Milestones */}
            {(() => {
              const completedMilestones = promotionPath.milestones.filter(m => m.completed);
              
              if (completedMilestones.length === 0) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-gray-700">Completed</h3>
                    <Badge variant="default" size="sm" className="text-xs bg-green-100 text-green-700 border-0">
                      {completedMilestones.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {completedMilestones.map((milestone, index) => {
                      const categoryColor = 
                        milestone.category === 'preparation' ? 'blue' :
                        milestone.category === 'visibility' ? 'amber' :
                        milestone.category === 'relationship' ? 'purple' :
                        milestone.category === 'execution' ? 'green' :
                        'blue';
                      
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Content */}
                          <div
                            onClick={() => setSelectedMilestone(milestone.id)}
                            className="p-4 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer transition-all opacity-60 hover:opacity-80"
                          >
                            {/* TOP ROW - Category Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={categoryColor as any}
                                size="sm"
                                className="text-[10px] uppercase font-medium opacity-60"
                              >
                                {milestone.category}
                              </Badge>
                            </div>

                            {/* MIDDLE - Title and Description */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-600 line-through mb-1">
                                  {milestone.title}
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {milestone.description}
                                </p>
                              </div>
                              <CaretRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                            </div>

                            {/* BOTTOM ROW - Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(milestone.targetDate)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
        </div>
      </div>

      {/* Milestone Detail Modal */}
      <Modal
        isOpen={!!selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        title={selectedMilestoneData?.title || 'Milestone'}
        size="md"
      >
        {selectedMilestoneData && (
          <div className="space-y-4">
            <p className="text-text-secondary">{selectedMilestoneData.description}</p>

            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  selectedMilestoneData.category === 'preparation' ? 'blue' :
                  selectedMilestoneData.category === 'visibility' ? 'cyan' :
                  selectedMilestoneData.category === 'relationship' ? 'purple' :
                  selectedMilestoneData.category === 'execution' ? 'amber' :
                  'default'
                }
              >
                {selectedMilestoneData.category}
              </Badge>
              <span className="text-sm text-text-muted">
                Target: {formatDate(selectedMilestoneData.targetDate)}
              </span>
            </div>

            <div className="bg-bg-tertiary rounded-xl p-4">
              <h4 className="font-medium text-text-primary mb-2">Suggested Actions</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <CaretRight className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                  Use the Coach to draft a conversation with your manager
                </li>
                <li className="flex items-start gap-2">
                  <CaretRight className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                  Block time in your calendar for preparation
                </li>
                <li className="flex items-start gap-2">
                  <CaretRight className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                  Review your wins for relevant proof points
                </li>
              </ul>
            </div>

            <div className="flex justify-between pt-4 border-t border-border-primary">
              <Button
                variant={selectedMilestoneData.completed ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  handleToggleMilestone(selectedMilestoneData.id);
                  setSelectedMilestone(null);
                }}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                {selectedMilestoneData.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleAddToWeek(selectedMilestoneData.title);
                  setSelectedMilestone(null);
                }}
              >
                Add to This Week
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

