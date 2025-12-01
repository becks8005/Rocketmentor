import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { 
  AppState, 
  User, 
  OnboardingData, 
  ManagerCanvas, 
  PromotionPath,
  WeekPlan,
  Win,
  ChatMessage,
  KanbanCard,
  CareerMove,
  CompetencyAssessment
} from '../types';
import { 
  saveToStorage, 
  loadFromStorage, 
  generateId, 
  getCurrentWeekStart,
  generateManagerCanvas,
  generatePromotionPath
} from '../utils/helpers';
import { COMPETENCIES } from '../data/constants';

// Initial State
const initialOnboarding: OnboardingData = {
  currentLevel: null,
  firmType: null,
  location: '',
  timezone: '',
  managerStressTrigger: null,
  managerPraiseTrigger: null,
  managerStyle: null,
  targetLevel: null,
  promotionHorizon: null,
  competencyAssessments: COMPETENCIES.map(c => ({
    competencyId: c.id,
    score: 3,
    example: '',
  })),
  weeklyCheckInDay: 'Monday',
  weeklyCheckInTime: '08:30',
};

const initialState: AppState = {
  user: null,
  onboarding: initialOnboarding,
  managerCanvas: null,
  promotionPath: null,
  weekPlans: [],
  wins: [],
  chatHistory: [],
};

// Action Types
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_ONBOARDING'; payload: Partial<OnboardingData> }
  | { type: 'UPDATE_COMPETENCY_ASSESSMENT'; payload: CompetencyAssessment }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SET_MANAGER_CANVAS'; payload: ManagerCanvas }
  | { type: 'SET_PROMOTION_PATH'; payload: PromotionPath }
  | { type: 'UPDATE_PROMOTION_PATH'; payload: Partial<PromotionPath> }
  | { type: 'ADD_WEEK_PLAN'; payload: WeekPlan }
  | { type: 'UPDATE_WEEK_PLAN'; payload: WeekPlan }
  | { type: 'ADD_CARD'; payload: { weekId: string; card: KanbanCard } }
  | { type: 'UPDATE_CARD'; payload: { weekId: string; card: KanbanCard } }
  | { type: 'DELETE_CARD'; payload: { weekId: string; cardId: string } }
  | { type: 'UPDATE_CAREER_MOVE'; payload: { weekId: string; move: CareerMove } }
  | { type: 'ADD_WIN'; payload: Win }
  | { type: 'UPDATE_WIN'; payload: Win }
  | { type: 'DELETE_WIN'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT_HISTORY' }
  | { type: 'TOGGLE_MILESTONE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'UPDATE_ONBOARDING':
      return { 
        ...state, 
        onboarding: { ...state.onboarding, ...action.payload } 
      };

    case 'UPDATE_COMPETENCY_ASSESSMENT': {
      const assessments = state.onboarding.competencyAssessments.map(a =>
        a.competencyId === action.payload.competencyId ? action.payload : a
      );
      return {
        ...state,
        onboarding: { ...state.onboarding, competencyAssessments: assessments }
      };
    }

    case 'COMPLETE_ONBOARDING': {
      const managerCanvas = generateManagerCanvas(state.onboarding);
      const promotionPath = generatePromotionPath(state.onboarding);
      return {
        ...state,
        user: state.user ? { ...state.user, onboardingCompleted: true } : null,
        managerCanvas,
        promotionPath,
      };
    }

    case 'SET_MANAGER_CANVAS':
      return { ...state, managerCanvas: action.payload };

    case 'SET_PROMOTION_PATH':
      return { ...state, promotionPath: action.payload };

    case 'UPDATE_PROMOTION_PATH':
      return {
        ...state,
        promotionPath: state.promotionPath 
          ? { ...state.promotionPath, ...action.payload }
          : null
      };

    case 'ADD_WEEK_PLAN':
      return { ...state, weekPlans: [...state.weekPlans, action.payload] };

    case 'UPDATE_WEEK_PLAN':
      return {
        ...state,
        weekPlans: state.weekPlans.map(wp =>
          wp.id === action.payload.id ? action.payload : wp
        )
      };

    case 'ADD_CARD': {
      const { weekId, card } = action.payload;
      return {
        ...state,
        weekPlans: state.weekPlans.map(wp =>
          wp.id === weekId 
            ? { ...wp, cards: [...wp.cards, card] }
            : wp
        )
      };
    }

    case 'UPDATE_CARD': {
      const { weekId, card } = action.payload;
      return {
        ...state,
        weekPlans: state.weekPlans.map(wp =>
          wp.id === weekId
            ? { ...wp, cards: wp.cards.map(c => c.id === card.id ? card : c) }
            : wp
        )
      };
    }

    case 'DELETE_CARD': {
      const { weekId, cardId } = action.payload;
      return {
        ...state,
        weekPlans: state.weekPlans.map(wp =>
          wp.id === weekId
            ? { ...wp, cards: wp.cards.filter(c => c.id !== cardId) }
            : wp
        )
      };
    }

    case 'UPDATE_CAREER_MOVE': {
      const { weekId, move } = action.payload;
      return {
        ...state,
        weekPlans: state.weekPlans.map(wp =>
          wp.id === weekId
            ? { ...wp, careerMoves: wp.careerMoves.map(m => m.id === move.id ? move : m) }
            : wp
        )
      };
    }

    case 'ADD_WIN':
      return { ...state, wins: [...state.wins, action.payload] };

    case 'UPDATE_WIN':
      return {
        ...state,
        wins: state.wins.map(w => w.id === action.payload.id ? action.payload : w)
      };

    case 'DELETE_WIN':
      return { ...state, wins: state.wins.filter(w => w.id !== action.payload) };

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };

    case 'CLEAR_CHAT_HISTORY':
      return { ...state, chatHistory: [] };

    case 'TOGGLE_MILESTONE':
      return {
        ...state,
        promotionPath: state.promotionPath
          ? {
              ...state.promotionPath,
              milestones: state.promotionPath.milestones.map(m =>
                m.id === action.payload ? { ...m, completed: !m.completed } : m
              )
            }
          : null
      };

    case 'LOGOUT':
      return initialState;

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helper functions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (firstName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getCurrentWeekPlan: () => WeekPlan | null;
  createWeekPlan: () => WeekPlan;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUser = loadFromStorage<User>('user');
    const savedOnboarding = loadFromStorage<OnboardingData>('onboarding');
    const savedManagerCanvas = loadFromStorage<ManagerCanvas>('managerCanvas');
    const savedPromotionPath = loadFromStorage<PromotionPath>('promotionPath');
    const savedWeekPlans = loadFromStorage<WeekPlan[]>('weekPlans');
    const savedWins = loadFromStorage<Win[]>('wins');
    const savedChatHistory = loadFromStorage<ChatMessage[]>('chatHistory');

    dispatch({
      type: 'LOAD_STATE',
      payload: {
        user: savedUser || null,
        onboarding: savedOnboarding || initialOnboarding,
        managerCanvas: savedManagerCanvas || null,
        promotionPath: savedPromotionPath || null,
        weekPlans: savedWeekPlans || [],
        wins: savedWins || [],
        chatHistory: savedChatHistory || [],
      }
    });
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (state.user) saveToStorage('user', state.user);
    saveToStorage('onboarding', state.onboarding);
    if (state.managerCanvas) saveToStorage('managerCanvas', state.managerCanvas);
    if (state.promotionPath) saveToStorage('promotionPath', state.promotionPath);
    saveToStorage('weekPlans', state.weekPlans);
    saveToStorage('wins', state.wins);
    saveToStorage('chatHistory', state.chatHistory);
  }, [state]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    const savedUser = loadFromStorage<User>('user');
    if (savedUser && savedUser.email === email) {
      dispatch({ type: 'SET_USER', payload: savedUser });
      return true;
    }
    return false;
  };

  const signup = async (firstName: string, email: string, _password: string): Promise<boolean> => {
    // Mock signup - in real app, this would call an API
    const newUser: User = {
      id: generateId(),
      firstName,
      email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    dispatch({ type: 'SET_USER', payload: newUser });
    saveToStorage('user', newUser);
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('rocketmentor_user');
  };

  const getCurrentWeekPlan = (): WeekPlan | null => {
    const weekStart = getCurrentWeekStart();
    return state.weekPlans.find(wp => wp.weekStartDate === weekStart) || null;
  };

  const createWeekPlan = (): WeekPlan => {
    const weekStart = getCurrentWeekStart();
    const existing = state.weekPlans.find(wp => wp.weekStartDate === weekStart);
    if (existing) return existing;

    const newPlan: WeekPlan = {
      id: generateId(),
      weekStartDate: weekStart,
      cards: [],
      careerMoves: [],
      reviewed: false,
    };
    dispatch({ type: 'ADD_WEEK_PLAN', payload: newPlan });
    return newPlan;
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      signup, 
      logout,
      getCurrentWeekPlan,
      createWeekPlan
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

