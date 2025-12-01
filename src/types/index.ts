// User & Authentication
export interface User {
  id: string;
  firstName: string;
  email: string;
  createdAt: string;
  onboardingCompleted: boolean;
  gettingStartedCompleted?: boolean;
  completedPageTours?: string[]; // Array of page paths that have completed their tours
}

// Onboarding Types
export type FirmType = 'strategy' | 'big4' | 'boutique' | 'inhouse' | 'other';
export type CurrentLevel = 'business_analyst' | 'junior_consultant' | 'associate' | 'consultant';
export type TargetLevel = 'consultant' | 'senior_consultant' | 'manager' | 'senior_manager';
export type PromotionHorizon = '6_months' | '6_12_months' | '12_18_months' | '18_plus_months';

export interface CompetencyAssessment {
  competencyId: string;
  score: number;
  example: string;
}

export interface OnboardingData {
  currentLevel: CurrentLevel | null;
  firmType: FirmType | null;
  location: string;
  timezone: string;
  managerStressTrigger: 'deadlines' | 'client' | 'utilisation' | 'politics' | null;
  managerPraiseTrigger: 'slides' | 'client_happy' | 'ownership' | 'team_support' | null;
  managerStyle: 'problem_solver' | 'relationship_builder' | 'operator' | null;
  targetLevel: TargetLevel | null;
  promotionHorizon: PromotionHorizon | null;
  competencyAssessments: CompetencyAssessment[];
  weeklyCheckInDay: string;
  weeklyCheckInTime: string;
}

// Manager Canvas
export interface ManagerCanvas {
  clientImpact: number;
  profitability: number;
  teamwork: number;
  internalContributions: number;
  optics: number;
  style: string;
  keyBehaviors: string[];
}

// Competency Model
export interface Competency {
  id: string;
  name: string;
  description: string;
  levelDescription: string;
  icon: string;
}

// Focus Area
export interface FocusArea {
  id: string;
  title: string;
  description: string;
  linkedCompetencies: string[];
  examples: string[];
}

// Competency Progress
export interface CompetencyProgress {
  competencyId: string;
  currentScore: number;
  targetScore: number;
  momentum: 'increasing' | 'stable' | 'decreasing';
  recentWins: number;
}

// Promotion Milestone
export interface PromotionMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  category: 'preparation' | 'visibility' | 'relationship' | 'execution' | 'review';
}

// Promotion Path
export interface PromotionPath {
  targetLevel: TargetLevel;
  targetDate: string;
  focusAreas: FocusArea[];
  competencies: CompetencyProgress[];
  milestones: PromotionMilestone[];
}

// Kanban Types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
export type CardType = 'deliverable' | 'meeting' | 'analysis' | 'workshop' | 'internal' | 'other';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  day: DayOfWeek;
  dueTime?: string;
  type: CardType;
  project?: string;
  completed: boolean;
  isWin: boolean;
  isSuggested: boolean;
  isSample?: boolean;
  notes: string;
  createdAt: string;
}

export interface CareerMove {
  id: string;
  title: string;
  description: string;
  category: 'impact' | 'relationship' | 'craft';
  linkedCompetencies: string[];
  committed: boolean;
  completed: boolean;
  linkedCardIds: string[];
}

export interface WeekPlan {
  id: string;
  weekStartDate: string;
  cards: KanbanCard[];
  careerMoves: CareerMove[];
  reviewed: boolean;
  reviewNotes?: string;
}

// Wins
export interface Win {
  id: string;
  title: string;
  description: string;
  rawText?: string;
  project?: string;
  competencyTags: string[];
  date: string;
  weekId?: string;
  sourceType: 'move' | 'kanban' | 'manual';
  sourceId?: string;
  metric?: string;
}

// Chat
export interface ChatContext {
  weekPlanId?: string;
  careerMoveIds?: string[];
  winIds?: string[];
  milestoneIds?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: ChatContext;
}

// App State
export interface AppState {
  user: User | null;
  onboarding: OnboardingData;
  managerCanvas: ManagerCanvas | null;
  promotionPath: PromotionPath | null;
  weekPlans: WeekPlan[];
  wins: Win[];
  chatHistory: ChatMessage[];
}
