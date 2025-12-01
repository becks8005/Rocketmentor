import type { Competency, CurrentLevel, TargetLevel, FirmType } from '../types/index';

export const COMPETENCIES: Competency[] = [
  {
    id: 'problem_solving',
    name: 'Problem Solving & Structured Thinking',
    description: 'Break down complex problems into clear, actionable components using frameworks and hypothesis-driven approaches.',
    levelDescription: 'Consistently apply structured problem-solving frameworks to client challenges.',
    icon: '🧩',
  },
  {
    id: 'client_impact',
    name: 'Client Impact & Stakeholder Management',
    description: 'Build strong relationships with clients, understand their needs, and deliver visible value.',
    levelDescription: 'Proactively manage client expectations and build trust through reliable delivery.',
    icon: '🎯',
  },
  {
    id: 'ownership',
    name: 'Ownership & Reliability',
    description: 'Take initiative, follow through on commitments, and own outcomes end-to-end.',
    levelDescription: 'Demonstrate ownership of workstreams and deliver without constant supervision.',
    icon: '⚡',
  },
  {
    id: 'teaming',
    name: 'Teaming & Leading Downwards',
    description: 'Collaborate effectively, support teammates, and start developing junior team members.',
    levelDescription: 'Be a reliable team player who actively supports others and shares knowledge.',
    icon: '🤝',
  },
  {
    id: 'communication',
    name: 'Communication & Storylining',
    description: 'Create clear, compelling narratives in presentations and written communications.',
    levelDescription: 'Structure clear slide decks and emails that convey insights effectively.',
    icon: '📝',
  },
  {
    id: 'commercial',
    name: 'Commercial Awareness',
    description: 'Understand business context, client economics, and what drives firm success.',
    levelDescription: 'Show awareness of project economics and opportunities for follow-on work.',
    icon: '💡',
  },
];

export const CURRENT_LEVELS: { value: CurrentLevel; label: string }[] = [
  { value: 'business_analyst', label: 'Business Analyst' },
  { value: 'junior_consultant', label: 'Junior Consultant' },
  { value: 'associate', label: 'Associate' },
  { value: 'consultant', label: 'Consultant' },
];

export const TARGET_LEVELS: { value: TargetLevel; label: string }[] = [
  { value: 'consultant', label: 'Consultant' },
  { value: 'senior_consultant', label: 'Senior Consultant' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior_manager', label: 'Senior Manager' },
];

export const FIRM_TYPES: { value: FirmType; label: string }[] = [
  { value: 'strategy', label: 'Strategy Firm (MBB, etc.)' },
  { value: 'big4', label: 'Big 4 / Advisory' },
  { value: 'boutique', label: 'Boutique Consulting' },
  { value: 'inhouse', label: 'In-house Consulting' },
  { value: 'other', label: 'Other' },
];

export const PROMOTION_HORIZONS = [
  { value: '6_months', label: 'Less than 6 months' },
  { value: '6_12_months', label: '6-12 months' },
  { value: '12_18_months', label: '12-18 months' },
  { value: '18_plus_months', label: 'More than 18 months' },
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const CARD_TYPES = [
  { value: 'deliverable', label: 'Deliverable', color: 'accent-blue' },
  { value: 'meeting', label: 'Meeting', color: 'accent-purple' },
  { value: 'analysis', label: 'Analysis', color: 'accent-cyan' },
  { value: 'workshop', label: 'Workshop', color: 'accent-amber' },
  { value: 'internal', label: 'Internal', color: 'accent-green' },
  { value: 'other', label: 'Other', color: 'text-secondary' },
];

export const MANAGER_STRESS_OPTIONS = [
  { value: 'deadlines', label: 'Deadlines and quality of deliverables' },
  { value: 'client', label: 'Unhappy client / escalation' },
  { value: 'utilisation', label: 'Utilisation / sales / pipeline' },
  { value: 'politics', label: 'Internal politics / stakeholders / firm priorities' },
];

export const MANAGER_PRAISE_OPTIONS = [
  { value: 'slides', label: 'Sharp slides and analyses' },
  { value: 'client_happy', label: 'Making the client visibly happy' },
  { value: 'ownership', label: 'Taking ownership and fixing things without being asked' },
  { value: 'team_support', label: 'Supporting the team, mentoring others, fixing internal issues' },
];

export const MANAGER_STYLE_OPTIONS = [
  { value: 'problem_solver', label: 'Intense problem solver', description: 'Deep in the details, sharp questions' },
  { value: 'relationship_builder', label: 'Relationship builder', description: 'Client and team focus' },
  { value: 'operator', label: 'Operator', description: 'Keeps things moving, cares about deadlines and logistics' },
];

export const DEFAULT_MILESTONES = [
  {
    id: 'understand_criteria',
    title: 'Understand the promotion criteria',
    description: 'Clarify which evaluations/review cycles matter and when. Know exactly what "ready" looks like.',
    category: 'preparation' as const,
    monthsBefore: 18,
  },
  {
    id: 'manager_conversation',
    title: 'Align with your manager on promotion goal',
    description: 'Have an explicit conversation about your promotion goal, target timing, and what evidence will be needed.',
    category: 'relationship' as const,
    monthsBefore: 12,
  },
  {
    id: 'high_visibility',
    title: 'Get staffed on high-visibility work',
    description: 'Ensure you are on at least one high-visibility client engagement where you can demonstrate impact.',
    category: 'visibility' as const,
    monthsBefore: 9,
  },
  {
    id: 'build_sponsors',
    title: 'Build sponsor relationships',
    description: 'Identify 1-2 senior sponsors and start building those relationships intentionally.',
    category: 'relationship' as const,
    monthsBefore: 9,
  },
  {
    id: 'mid_cycle_feedback',
    title: 'Collect strong mid-cycle feedback',
    description: 'Get snapshot reviews supporting that you are operating at the next level.',
    category: 'execution' as const,
    monthsBefore: 6,
  },
  {
    id: 'blocker_check',
    title: 'Do a 360 blocker check',
    description: 'Are there any blockers or detractors you need to address before promotion discussions?',
    category: 'preparation' as const,
    monthsBefore: 4,
  },
  {
    id: 'prepare_case',
    title: 'Prepare your promotion case',
    description: 'Create a one-pager with your main proof points structured by competency.',
    category: 'execution' as const,
    monthsBefore: 2,
  },
  {
    id: 'align_supporters',
    title: 'Align your manager and sponsors',
    description: 'Ensure they will actively support you in the promotion committee.',
    category: 'relationship' as const,
    monthsBefore: 1,
  },
];

export const LOCATION_SUGGESTIONS = [
  'New York, NY, USA',
  'London, UK',
  'Singapore',
  'Dubai, UAE',
  'Sydney, Australia',
  'Toronto, Canada',
  'Chicago, IL, USA',
  'San Francisco, CA, USA',
  'Hong Kong',
  'Paris, France',
  'Frankfurt, Germany',
  'Mumbai, India',
  'São Paulo, Brazil',
  'Tokyo, Japan',
  'Zurich, Switzerland',
];

