import { v4 as uuidv4 } from 'uuid';
import type { 
  OnboardingData, 
  ManagerCanvas, 
  PromotionPath, 
  FocusArea, 
  PromotionMilestone,
  KanbanCard,
  CareerMove,
  Win,
  DayOfWeek
} from '../types';
import { COMPETENCIES, DEFAULT_MILESTONES } from '../data/constants';

export const generateId = (): string => uuidv4();

export const getCurrentWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Parse time input from various formats and convert to HH:MM (24-hour format)
export const parseTimeInput = (input: string): string | null => {
  if (!input || !input.trim()) return null;
  
  const trimmed = input.trim().toUpperCase();
  
  // Already in HH:MM format (e.g., "08:30", "8:30")
  const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    const hours = parseInt(hhmmMatch[1]);
    const minutes = parseInt(hhmmMatch[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Format with AM/PM (e.g., "8:30 AM", "8:30AM", "8:30am", "08:30 PM")
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = parseInt(ampmMatch[2]);
    const ampm = ampmMatch[3];
    
    if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59) {
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Format without colon (e.g., "830", "0830")
  const noColonMatch = trimmed.match(/^(\d{3,4})(AM|PM)?$/);
  if (noColonMatch) {
    const timeStr = noColonMatch[1];
    const ampm = noColonMatch[2];
    
    if (timeStr.length === 3) {
      // 3 digits: HMM (e.g., "830" = 8:30)
      const hours = parseInt(timeStr[0]);
      const minutes = parseInt(timeStr.slice(1));
      if (hours >= 0 && hours <= 9 && minutes >= 0 && minutes <= 59) {
        let finalHours = hours;
        if (ampm === 'PM' && hours !== 12) {
          finalHours += 12;
        } else if (ampm === 'AM' && hours === 12) {
          finalHours = 0;
        }
        return `${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    } else if (timeStr.length === 4) {
      // 4 digits: HHMM (e.g., "0830" = 08:30)
      const hours = parseInt(timeStr.slice(0, 2));
      const minutes = parseInt(timeStr.slice(2));
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        let finalHours = hours;
        if (ampm) {
          if (ampm === 'PM' && hours !== 12) {
            finalHours = hours + 12;
          } else if (ampm === 'AM' && hours === 12) {
            finalHours = 0;
          }
        }
        return `${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
  }
  
  return null; // Invalid format
};

// Format time from HH:MM to display format (12-hour with AM/PM)
export const formatTimeForDisplay = (time: string): string => {
  if (!time || !time.includes(':')) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  if (isNaN(hour) || hour < 0 || hour > 23) return '';
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getPromotionTargetDate = (horizon: string): Date => {
  const now = new Date();
  switch (horizon) {
    case '6_months':
      return new Date(now.setMonth(now.getMonth() + 6));
    case '6_12_months':
      return new Date(now.setMonth(now.getMonth() + 9));
    case '12_18_months':
      return new Date(now.setMonth(now.getMonth() + 15));
    case '18_plus_months':
      return new Date(now.setMonth(now.getMonth() + 24));
    default:
      return new Date(now.setMonth(now.getMonth() + 12));
  }
};

// Generate Manager Canvas from calibration answers
export const generateManagerCanvas = (onboarding: OnboardingData): ManagerCanvas => {
  const canvas: ManagerCanvas = {
    clientImpact: 3,
    profitability: 3,
    teamwork: 3,
    internalContributions: 2,
    optics: 3,
    style: '',
    keyBehaviors: [],
  };

  // Adjust based on stress trigger
  switch (onboarding.managerStressTrigger) {
    case 'deadlines':
      canvas.optics = 4;
      canvas.keyBehaviors.push('Always meet deadlines, even small ones');
      break;
    case 'client':
      canvas.clientImpact = 5;
      canvas.keyBehaviors.push('Make client satisfaction visible');
      break;
    case 'utilisation':
      canvas.profitability = 5;
      canvas.keyBehaviors.push('Show awareness of project economics');
      break;
    case 'politics':
      canvas.internalContributions = 4;
      canvas.optics = 4;
      canvas.keyBehaviors.push('Help navigate stakeholder dynamics');
      break;
  }

  // Adjust based on praise trigger
  switch (onboarding.managerPraiseTrigger) {
    case 'slides':
      canvas.keyBehaviors.push('Deliver polished, sharp deliverables');
      break;
    case 'client_happy':
      canvas.clientImpact = Math.min(5, canvas.clientImpact + 1);
      canvas.keyBehaviors.push('Build direct client relationships');
      break;
    case 'ownership':
      canvas.keyBehaviors.push('Take initiative without being asked');
      break;
    case 'team_support':
      canvas.teamwork = 5;
      canvas.keyBehaviors.push('Support and enable teammates');
      break;
  }

  // Set style
  switch (onboarding.managerStyle) {
    case 'problem_solver':
      canvas.style = 'Detail-oriented and analytical';
      canvas.keyBehaviors.push('Be prepared for deep-dive questions');
      break;
    case 'relationship_builder':
      canvas.style = 'People-focused and collaborative';
      canvas.keyBehaviors.push('Communicate frequently and build rapport');
      break;
    case 'operator':
      canvas.style = 'Execution-focused and efficient';
      canvas.keyBehaviors.push('Keep things moving, minimize blockers');
      break;
  }

  return canvas;
};

// Generate Focus Areas from competency assessments
export const generateFocusAreas = (onboarding: OnboardingData): FocusArea[] => {
  const assessments = onboarding.competencyAssessments;
  const sorted = [...assessments].sort((a, b) => a.score - b.score);
  
  const focusAreas: FocusArea[] = [];
  
  // Take bottom 3-4 competencies as focus areas
  const weakest = sorted.slice(0, 3);
  
  weakest.forEach((assessment) => {
    const competency = COMPETENCIES.find(c => c.id === assessment.competencyId);
    if (!competency) return;
    
    focusAreas.push({
      id: generateId(),
      title: getFocusAreaTitle(competency.id, assessment.score),
      description: getFocusAreaDescription(competency.id, assessment.score),
      linkedCompetencies: [competency.id],
      examples: [],
    });
  });

  return focusAreas;
};

const getFocusAreaTitle = (competencyId: string, score: number): string => {
  const titles: Record<string, string[]> = {
    problem_solving: ['Sharpen your structured thinking', 'Build your analytical toolkit'],
    client_impact: ['Make your client impact visible', 'Build client relationships proactively'],
    ownership: ['Take more initiative', 'Own outcomes end-to-end'],
    teaming: ['Elevate your team contributions', 'Start building your leadership presence'],
    communication: ['Level up your storylining', 'Make your communications more compelling'],
    commercial: ['Develop business sense', 'Show commercial awareness'],
  };
  return titles[competencyId]?.[score < 3 ? 0 : 1] || 'Develop this competency';
};

const getFocusAreaDescription = (competencyId: string, score: number): string => {
  const descriptions: Record<string, string> = {
    problem_solving: 'Structure problems clearly before diving in. Use hypothesis trees and issue trees to break down complex challenges.',
    client_impact: 'Find ways to make your contributions visible to clients. Proactively share updates and build relationships.',
    ownership: 'Look for opportunities to take initiative. Own workstreams without constant supervision and follow through reliably.',
    teaming: 'Be the teammate everyone wants to work with. Support others, share knowledge, and start developing junior members.',
    communication: 'Create clearer narratives. Focus on the "so what" and structure your slides with a compelling storyline.',
    commercial: 'Understand project economics and look for opportunities to add value beyond the immediate scope.',
  };
  return descriptions[competencyId] || 'Focus on developing this competency through deliberate practice.';
};

// Generate Promotion Milestones
export const generateMilestones = (targetDate: Date): PromotionMilestone[] => {
  const now = new Date();
  const monthsUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  return DEFAULT_MILESTONES
    .filter(m => m.monthsBefore <= monthsUntilTarget)
    .map(m => {
      const milestoneDate = new Date(targetDate);
      milestoneDate.setMonth(milestoneDate.getMonth() - m.monthsBefore);
      
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        targetDate: milestoneDate.toISOString(),
        completed: false,
        category: m.category,
      };
    })
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
};

// Generate Promotion Path
export const generatePromotionPath = (onboarding: OnboardingData): PromotionPath => {
  const targetDate = getPromotionTargetDate(onboarding.promotionHorizon || '12_18_months');
  
  return {
    targetLevel: onboarding.targetLevel || 'consultant',
    targetDate: targetDate.toISOString(),
    focusAreas: generateFocusAreas(onboarding),
    competencies: onboarding.competencyAssessments.map(a => ({
      competencyId: a.competencyId,
      currentScore: a.score,
      targetScore: Math.min(5, a.score + 1),
      momentum: 'stable' as const,
      recentWins: 0,
    })),
    milestones: generateMilestones(targetDate),
  };
};

// AI Mock Functions
export const generateCompetencyExample = (competencyId: string, firmType: string): string => {
  const examples: Record<string, Record<string, string>> = {
    problem_solving: {
      strategy: 'Structured a market entry analysis using a decision tree framework, identifying 3 key criteria that helped the team prioritize geographies.',
      big4: 'Built a process mapping diagram that identified 4 efficiency improvements in the client\'s order-to-cash cycle.',
      default: 'Applied a structured approach to break down a complex problem into manageable components.',
    },
    client_impact: {
      strategy: 'Received positive feedback from the client CFO after presenting analysis findings that directly influenced their investment decision.',
      big4: 'Built a strong working relationship with the client project lead, becoming their first point of contact for analysis questions.',
      default: 'Delivered work that the client specifically mentioned as valuable in a steering meeting.',
    },
    ownership: {
      strategy: 'Took ownership of the entire competitive analysis workstream, coordinating with 2 analysts and delivering ahead of schedule.',
      big4: 'Proactively identified a data quality issue and fixed it before it impacted the project timeline.',
      default: 'Took initiative on a project deliverable without being asked and delivered it successfully.',
    },
    teaming: {
      strategy: 'Helped onboard a new analyst by creating a knowledge transfer document and pairing on the first analysis.',
      big4: 'Stepped in to support a colleague who was overloaded, helping them meet their deadline.',
      default: 'Supported teammates and contributed to a positive team dynamic.',
    },
    communication: {
      strategy: 'Restructured a 40-slide deck into a 15-slide executive summary with a clear "so what" on each page.',
      big4: 'Created a one-page summary that the partner used directly in the client steering meeting.',
      default: 'Delivered a clear presentation that effectively communicated complex findings.',
    },
    commercial: {
      strategy: 'Identified a potential follow-on engagement during client interviews and flagged it to the engagement manager.',
      big4: 'Suggested a scope optimization that reduced project cost while maintaining deliverable quality.',
      default: 'Showed awareness of project economics and opportunities for additional value.',
    },
  };
  
  const competencyExamples = examples[competencyId] || {};
  return competencyExamples[firmType] || competencyExamples.default || 'Added value in this area during a recent project.';
};

export const generateSubTasks = (card: KanbanCard): Partial<KanbanCard>[] => {
  const subTasks: Partial<KanbanCard>[] = [];
  const title = card.title.toLowerCase();
  
  if (title.includes('proposal') || title.includes('deck') || title.includes('presentation')) {
    subTasks.push(
      { title: 'Create first draft outline', type: 'deliverable', isSuggested: true },
      { title: 'Send draft to manager for early feedback', type: 'internal', isSuggested: true },
      { title: 'Incorporate feedback and polish', type: 'deliverable', isSuggested: true },
    );
  } else if (title.includes('meeting') || title.includes('call') || title.includes('sync')) {
    subTasks.push(
      { title: 'Prepare meeting agenda/talking points', type: 'internal', isSuggested: true },
      { title: 'Send pre-read to attendees', type: 'internal', isSuggested: true },
    );
  } else if (title.includes('analysis') || title.includes('model')) {
    subTasks.push(
      { title: 'Define analysis approach and key questions', type: 'analysis', isSuggested: true },
      { title: 'Build draft analysis', type: 'analysis', isSuggested: true },
      { title: 'Validate findings with manager', type: 'internal', isSuggested: true },
    );
  }
  
  return subTasks;
};

export const generateCareerMoves = (
  cards: KanbanCard[], 
  managerCanvas: ManagerCanvas | null,
  focusAreas: FocusArea[]
): CareerMove[] => {
  const moves: CareerMove[] = [];
  
  // Impact move
  const impactCard = cards.find(c => 
    c.type === 'deliverable' || 
    c.title.toLowerCase().includes('client') ||
    c.title.toLowerCase().includes('presentation')
  );
  
  moves.push({
    id: generateId(),
    title: impactCard 
      ? `Own the "${impactCard.title}" deliverable end-to-end`
      : 'Find one deliverable to own completely this week',
    description: impactCard
      ? `Take full ownership of this deliverable. Send proactive updates to your manager before they ask. This demonstrates reliability and makes your impact visible.`
      : `Look for an opportunity to take full ownership of a piece of work. Proactively update stakeholders on progress.`,
    category: 'impact',
    linkedCompetencies: ['ownership', 'client_impact'],
    committed: false,
    completed: false,
    linkedCardIds: impactCard ? [impactCard.id] : [],
  });
  
  // Relationship move
  moves.push({
    id: generateId(),
    title: 'Have a 10-minute check-in with your manager',
    description: `Ask about priorities for the week and what would make their life easier. This builds trust and ensures you're focused on what matters most to them.`,
    category: 'relationship',
    linkedCompetencies: ['client_impact', 'teaming'],
    committed: false,
    completed: false,
    linkedCardIds: [],
  });
  
  // Craft move based on focus areas
  const craftFocus = focusAreas[0];
  moves.push({
    id: generateId(),
    title: craftFocus 
      ? `Practice: ${craftFocus.title}`
      : 'Improve one deliverable beyond "good enough"',
    description: craftFocus
      ? craftFocus.description
      : `Take one piece of work this week and invest extra effort to make it excellent. This builds your craft and creates visible proof of quality.`,
    category: 'craft',
    linkedCompetencies: craftFocus?.linkedCompetencies || ['communication'],
    committed: false,
    completed: false,
    linkedCardIds: [],
  });
  
  return moves;
};

export const generateWinDescription = (title: string, rawText: string): string => {
  // Mock STAR format generation
  return `**Situation:** During a project requiring ${title.toLowerCase()}.

**Task:** I was responsible for delivering this work on time with high quality.

**Action:** ${rawText || 'I took ownership of the deliverable, proactively communicated progress, and ensured alignment with stakeholders.'}

**Result:** Successfully delivered the work, received positive feedback, and contributed to project success.`;
};

export const parseWeekDump = (text: string): Partial<KanbanCard>[] => {
  const cards: Partial<KanbanCard>[] = [];
  const lines = text.split(/[,\n]/).filter(l => l.trim());
  
  // Map both abbreviations and full day names
  const dayPatterns: Record<string, DayOfWeek> = {
    'mon': 'monday',
    'monday': 'monday',
    'tue': 'tuesday',
    'tuesday': 'tuesday',
    'wed': 'wednesday',
    'wednesday': 'wednesday',
    'thu': 'thursday',
    'thursday': 'thursday',
    'fri': 'friday',
    'friday': 'friday',
  };
  
  let currentDay: DayOfWeek = 'monday';
  
  lines.forEach(line => {
    const trimmed = line.trim();
    const lowerTrimmed = trimmed.toLowerCase();
    
    // Match day names at the start of the line (both abbreviations and full names)
    // Pattern matches: "mon", "monday", "wed", "wednesday", etc. optionally followed by colon or space
    const dayMatch = lowerTrimmed.match(/^(monday|tuesday|wednesday|thursday|friday|mon|tue|wed|thu|fri)\b/i);
    
    if (dayMatch) {
      const matchedDay = dayMatch[1].toLowerCase();
      // Normalize to full day name for lookup
      const normalizedDay = matchedDay.length <= 3 
        ? dayPatterns[matchedDay] 
        : matchedDay as DayOfWeek;
      
      if (normalizedDay && dayPatterns[normalizedDay]) {
        currentDay = dayPatterns[normalizedDay];
        // Remove the day prefix and any colon/space after it
        const content = trimmed.replace(/^(monday|tuesday|wednesday|thursday|friday|mon|tue|wed|thu|fri)[a-z]*:?\s*/i, '').trim();
        if (content) {
          cards.push({
            id: generateId(),
            title: content,
            day: currentDay,
            type: inferCardType(content),
            isSuggested: false,
          });
        }
      }
    } else if (trimmed) {
      cards.push({
        id: generateId(),
        title: trimmed,
        day: currentDay,
        type: inferCardType(trimmed),
        isSuggested: false,
      });
    }
  });
  
  return cards;
};

const inferCardType = (text: string): KanbanCard['type'] => {
  const lower = text.toLowerCase();
  if (lower.includes('meeting') || lower.includes('call') || lower.includes('sync')) return 'meeting';
  if (lower.includes('workshop')) return 'workshop';
  if (lower.includes('analysis') || lower.includes('model')) return 'analysis';
  if (lower.includes('deck') || lower.includes('slide') || lower.includes('proposal') || lower.includes('deliverable')) return 'deliverable';
  if (lower.includes('internal') || lower.includes('admin')) return 'internal';
  return 'other';
};

// Coach AI responses
export const generateCoachResponse = (
  message: string,
  context: {
    managerCanvas?: ManagerCanvas | null;
    focusAreas?: FocusArea[];
    upcomingMilestones?: PromotionMilestone[];
  }
): string => {
  const lower = message.toLowerCase();
  
  if (lower.includes('deadline') && lower.includes('unrealistic')) {
    return `Here's how to approach this conversation:

**Frame it as problem-solving, not complaining:**

"I want to make sure we deliver quality work. I've mapped out what's needed, and I see a risk with [specific timeline]. Can I walk you through my thinking?"

**Come with options:**
- "We could de-scope X to hit the date"
- "We could bring in Y for specific task"  
- "We could deliver a draft by [date] and polish by [later date]"

**Key behaviors:**
- Be specific about what's at risk
- Never say "I can't" - say "here's what's possible"
- Show you've already tried to solve it

${context.managerCanvas?.style === 'Execution-focused and efficient' 
  ? '\n*Given your manager\'s execution focus, lead with the options and be crisp about trade-offs.*' 
  : ''}`;
  }
  
  if (lower.includes('prioritize') || lower.includes('too many tasks')) {
    return `For prioritization, use this framework:

**Manager-visibility matrix:**
1. **Do first:** Work your manager will see or ask about
2. **Do second:** Work that affects client relationships  
3. **Do third:** Work that builds your competencies
4. **Delegate/defer:** Everything else

**This week, focus on:**
${context.focusAreas?.[0] 
  ? `- Your focus area: "${context.focusAreas[0].title}" - pick tasks that let you demonstrate this` 
  : '- Tasks that create visible wins'}

**Pro tip:** Send your manager a quick note: "Given competing priorities, I'm planning to focus on X and Y today. Does that align with what you need?" This shows ownership AND ensures you're not working on the wrong things.`;
  }
  
  if (lower.includes('promotion') && (lower.includes('tell') || lower.includes('say') || lower.includes('conversation'))) {
    return `Here's how to frame the promotion conversation:

**Opening:**
"I'd like to talk about my development path. I'm committed to growing here and I want to make sure I'm focused on the right things."

**Core message:**
"My goal is to be ready for [next level] by [timeframe]. I'd love your perspective on:
- What does 'ready' look like from your view?
- What evidence will matter most?
- Are there any gaps I should be addressing now?"

**Close:**
"What's the best way to check in on this periodically?"

${context.upcomingMilestones?.find(m => m.id === 'manager_conversation')
  ? '\n*This aligns with your upcoming milestone: "Align with your manager on promotion goal" - this conversation is exactly what you need.*'
  : ''}

**What NOT to say:**
- Don't make it sound transactional
- Don't compare yourself to peers
- Don't ask "when will I be promoted?" - ask "what do I need to demonstrate?"`;
  }
  
  if (lower.includes('update') || lower.includes('email') || lower.includes('draft')) {
    return `Here's a template for a strong weekly update:

---

**Subject:** Weekly update - [Your name] - [Week of X]

**This week:**
- ✅ [Completed item with impact] - [one-line result]
- ✅ [Completed item] 
- 🔄 [In progress item] - on track for [date]

**Next week:**
- [Key deliverable 1]
- [Key deliverable 2]

**Flags/asks:**
- [Any blockers or decisions needed]

---

**Pro tips:**
- Lead with completions, not activities
- Include one "impact" statement (client reaction, time saved, etc.)
- Keep it under 10 lines
- Send Monday morning or Friday afternoon

Would you like me to help draft this based on your current week?`;
  }
  
  // Default response
  return `That's a great question. Let me think about this from a promotion perspective.

In consulting, success isn't just about doing good work. It's about making sure the right people see that work and associate you with positive outcomes.

**A few things to consider:**

1. **Manage up proactively:** Don't wait to be asked. Send updates before your manager needs them.

2. **Make your manager's life easier:** What's stressing them? Help solve it, even if it's not "your job."

3. **Build your story:** Everything you do should connect to a competency you want to demonstrate.

${context.focusAreas?.[0] 
  ? `\n*Based on your focus area "${context.focusAreas[0].title}", I'd especially focus on opportunities that let you demonstrate this.*`
  : ''}

Is there a specific situation you'd like me to help you navigate?`;
};

// Local Storage helpers
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`rocketmentor_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(`rocketmentor_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
};

export const clearStorage = (): void => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('rocketmentor_'))
    .forEach(key => localStorage.removeItem(key));
};

