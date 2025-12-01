import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperPlaneTilt, 
  Sparkle, 
  User,
  Lightbulb,
  FileText,
  Target,
  Clock,
  Trash,
  Plus,
  ChatCircle,
  Info
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/ui';
import type { ChatMessage } from '../types';
import { generateId, generateCoachResponse, formatDate } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  {
    icon: Target,
    text: "How do I tell my manager that I want to get promoted next cycle?",
    category: 'promotion'
  },
  {
    icon: FileText,
    text: "Can you help me draft a weekly update email for my manager?",
    category: 'communication'
  },
  {
    icon: Clock,
    text: "I have 7 tasks tomorrow and only time for 3. Which should I do?",
    category: 'prioritization'
  },
  {
    icon: Lightbulb,
    text: "How do I push back on an unrealistic deadline without looking weak?",
    category: 'communication'
  },
];

export const CoachPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { chatHistory, managerCanvas, promotionPath, wins } = state;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = generateCoachResponse(inputValue, {
      managerCanvas,
      focusAreas: promotionPath?.focusAreas,
      upcomingMilestones: promotionPath?.milestones.filter(m => !m.completed),
    });

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: assistantMessage });
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    if (confirm('Clear all chat history?')) {
      dispatch({ type: 'CLEAR_CHAT_HISTORY' });
    }
  };

  const handleNewChat = () => {
    if (chatHistory.length > 0) {
      if (confirm('Start a new conversation? Current chat will be cleared.')) {
        dispatch({ type: 'CLEAR_CHAT_HISTORY' });
      }
    }
  };

  // Group chat history by date for the sidebar
  const groupedChats = chatHistory.reduce((acc, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  // Get first user message of each "session" for preview
  const chatPreviews = Object.entries(groupedChats).map(([date, messages]) => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    return {
      date,
      preview: firstUserMessage?.content.slice(0, 50) || 'New conversation',
      messageCount: messages.length,
    };
  });

  // Build context info for tooltip
  const contextItems: string[] = [];
  if (managerCanvas) {
    contextItems.push(`Manager Style: ${managerCanvas.style}`);
    if (managerCanvas.priorities?.length) {
      contextItems.push(`Manager Priorities: ${managerCanvas.priorities.join(', ')}`);
    }
  }
  if (promotionPath) {
    contextItems.push(`Target Role: ${promotionPath.targetLevel.replace('_', ' ')}`);
    if (promotionPath.focusAreas?.length) {
      contextItems.push(`Focus Areas: ${promotionPath.focusAreas.join(', ')}`);
    }
  }
  if (wins.length > 0) {
    contextItems.push(`${wins.length} recorded wins`);
  }

  return (
    <div className="h-[calc(100vh-8rem+4px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div data-guide="coach-header">
          <h1 className="text-2xl font-bold text-text-primary">
            Coach
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-text-secondary max-w-[420px] md:max-w-lg lg:max-w-xl">
            Get advice tailored to your manager's style and promotion goals. Ask about pushback scripts, prioritization, or how to phrase requests.
          </p>
            {/* Info icon with context tooltip */}
            <div className="relative group">
              <button className="p-1 rounded-full hover:bg-bg-hover transition-colors">
                <Info className="w-4 h-4 text-text-muted group-hover:text-accent-cyan transition-colors" />
              </button>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-bg-elevated border border-border-secondary rounded-xl p-4 shadow-xl min-w-[280px] max-w-[350px]">
                  <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-accent-green" />
                    Context Used for Coaching
                  </h4>
                  {contextItems.length > 0 ? (
                    <ul className="space-y-1.5">
                      {contextItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-muted italic">
                      No context loaded yet. Set up your Manager Canvas and Promotion Path for personalized advice.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Chat Container with Divider */}
      <Card padding="none" className="flex-1 flex overflow-hidden">
        {/* LEFT: Past Chats Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r border-border-primary">
          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto">
              {chatPreviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <ChatCircle className="w-8 h-8 text-text-muted/40 mb-2" />
                <p className="text-xs text-text-muted">
                  No conversations yet. Start chatting!
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {chatPreviews.map((chat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="p-2.5 rounded-lg bg-bg-hover/50 hover:bg-bg-hover transition-colors cursor-pointer border border-transparent hover:border-border-secondary">
                      <p className="text-sm text-text-primary font-medium truncate">
                        {chat.preview}...
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-text-muted">{chat.date}</span>
                        <span className="text-xs text-text-muted">{chat.messageCount} msgs</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* New Chat Button - Fixed at Bottom (matches input area height) */}
          <div className="p-4 border-t border-border-primary">
            <div className="flex items-center" style={{ minHeight: '48px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNewChat}
                icon={<Plus className="w-4 h-4" />}
                className="w-full justify-center"
              >
                New Chat
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-2 text-center invisible">
              Placeholder
            </p>
          </div>
        </div>

        {/* RIGHT: Current Chat Window */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 flex items-center justify-center mb-4">
                <Sparkle className="w-8 h-8 text-accent-green" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                How can I help you today?
              </h3>
              <p className="text-text-secondary max-w-md mb-6">
                I'm your AI mentor, trained on consulting best practices. Ask me about managing up, 
                navigating politics, or getting promoted.
              </p>

              {/* Suggested Questions */}
              <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3" data-guide="suggested-questions">
                {SUGGESTED_QUESTIONS.map((question, index) => {
                  const Icon = question.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSuggestedQuestion(question.text)}
                      className="p-3 rounded-xl bg-bg-tertiary border border-border-primary hover:border-border-secondary text-left transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0 group-hover:bg-accent-blue/10 transition-colors">
                          <Icon className="w-4 h-4 text-text-muted group-hover:text-accent-blue transition-colors" />
                        </div>
                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                          {question.text}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center flex-shrink-0">
                      <Sparkle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div 
                    className={`
                      max-w-[70%] rounded-2xl px-4 py-3
                      ${message.role === 'user' 
                        ? 'bg-accent-blue text-white' 
                        : 'bg-bg-tertiary text-text-primary border border-border-primary'
                      }
                    `}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="text-text-primary mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="text-accent-cyan font-semibold">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="text-text-secondary">{children}</li>,
                            code: ({ children }) => <code className="bg-bg-hover px-1 py-0.5 rounded text-accent-cyan text-sm">{children}</code>,
                            h4: ({ children }) => <h4 className="font-semibold text-text-primary mt-3 mb-1">{children}</h4>,
                            hr: () => <hr className="border-border-primary my-3" />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/60' : 'text-text-muted'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-rose flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center flex-shrink-0">
                    <Sparkle className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-bg-tertiary rounded-2xl px-4 py-3 border border-border-primary">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border-primary bg-bg-secondary">
          <div className="flex gap-3">
            <div className="flex-1 relative" data-guide="chat-input">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your consulting career..."
                rows={1}
                className="w-full px-4 py-3 bg-bg-elevated border border-border-primary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-4"
              icon={<PaperPlaneTilt className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
        </div>
      </Card>
    </div>
  );
};

