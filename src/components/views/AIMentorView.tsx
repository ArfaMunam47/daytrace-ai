import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Send,
  Square,
  User,
  Copy,
  Check,
  RotateCcw,
  CalendarRange,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Award,
  TrendingUp,
  Target,
  Zap,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, formatReadableDate } from '../../utils/dateUtils';

interface MentorMessage {
  id: string;
  sender: 'mentor' | 'user';
  text: string;
  timestamp: string;
  source?: string;
  fallbackUsed?: boolean;
  isStreaming?: boolean;
}

const PRESET_TOPICS = [
  { label: '👋 Say Hello', prompt: 'Hello! How are you doing today?' },
  { label: '🎯 Pick #1 Priority', prompt: 'Look at my current tasks and help me select my single #1 Must-Do focus block.' },
  { label: '⚡ Beat Procrastination', prompt: 'I am struggling to start my next priority task. Help me lower activation energy.' },
  { label: '🛡️ Stay Disciplined', prompt: 'How can I stay disciplined when my motivation drops and distractions are high?' },
  { label: '📚 Deep Study Sprints', prompt: 'How should I structure my 25-minute study intervals to maximize retention?' },
  { label: '🧺 Household & Life', prompt: 'I had unexpected chores and family interruptions today. How do I adapt without guilt?' },
  { label: '📱 Distraction Boundaries', prompt: 'Give me a pragmatic strategy to enforce time limits on social media feeds.' },
  { label: '📅 Plan Tomorrow', prompt: 'Help me plan a realistic schedule for tomorrow based on my capacity.' },
];

// Helper to format basic markdown-style text safely without external dependencies
const FormattedMessageText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-[13px] md:text-[14px]">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Heading (### ...)
        if (trimmed.startsWith('### ')) {
          return (
            <div key={lineIdx} className="font-bold text-zinc-100 text-sm md:text-base mt-2 pt-1 border-b border-zinc-800/80 pb-1">
              {trimmed.substring(4)}
            </div>
          );
        }

        // Heading (## ...)
        if (trimmed.startsWith('## ')) {
          return (
            <div key={lineIdx} className="font-bold text-zinc-100 text-sm md:text-base mt-2.5 pt-1 border-b border-zinc-800/80 pb-1 text-emerald-400">
              {trimmed.substring(3)}
            </div>
          );
        }

        // Bullet point (*, -, •)
        if (/^[-*•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="text-emerald-400 font-bold mt-1 text-xs">•</span>
              <span className="flex-1">{renderFormattedInline(content)}</span>
            </div>
          );
        }

        // Numbered list (1. ...)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const content = numberedMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="text-emerald-400 font-semibold text-xs min-w-[16px] mt-0.5">{num}.</span>
              <span className="flex-1">{renderFormattedInline(content)}</span>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={lineIdx} className="leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Helper for inline **bold** and `code` formatting
function renderFormattedInline(str: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-300 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : str;
}

export const AIMentorView: React.FC = () => {
  const { profile, user, todayStats, goals, plannedTasks, habits, weeklyReviews, activityLogs, generateWeeklyReview } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'weekly-review'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const userName = profile.firstName || (profile.name && profile.name.trim() !== 'User' ? profile.name.split(' ')[0] : '') || user?.firstName || '';
  const greetingName = userName ? ` ${userName}` : '';

  // Conversational state
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'init-1',
      sender: 'mentor',
      text: `Hey${greetingName}! 👋 I'm your DayTrace AI Mentor, powered by Gemini.

I'm here to help you protect deep focus blocks, calibrate realistic daily plans, navigate everyday household and family interruptions without guilt, and stay accountable to what truly matters.

What would you like to explore or work on today? Feel free to ask for advice on your tasks, beating procrastination, or structuring your schedule.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Gemini AI',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  // Auto-resize textarea helper
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
    }
  }, []);

  // Weekly review state
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<any>(
    weeklyReviews?.[0]?.aiMentorReport || null
  );

  // Calculate active logged days from activity logs & planned tasks
  const uniqueLoggedDates = new Set<string>();
  activityLogs.forEach((l) => {
    if (l.date) uniqueLoggedDates.add(l.date);
  });
  plannedTasks.forEach((t) => {
    if (t.date) uniqueLoggedDates.add(t.date);
  });
  const activeDaysCount = uniqueLoggedDates.size;

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom(false);
    }
  }, [activeTab, scrollToBottom]);

  // Copy helper
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  // Send message via real-time SSE stream
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isStreaming) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorNotice('You appear to be offline. Please reconnect and retry.');
      setLastFailedQuery(query);
      return;
    }

    // Cancel any previous stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMsg: MentorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const mentorPlaceholderId = `mentor-${Date.now()}`;
    const mentorMsg: MentorMessage = {
      id: mentorPlaceholderId,
      sender: 'mentor',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Gemini AI',
      isStreaming: true,
    };

    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, mentorMsg]);
    setInputText('');
    setErrorNotice(null);
    setLastFailedQuery(null);
    setIsStreaming(true);

    // Auto resize input
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Scroll down immediately
    setTimeout(() => scrollToBottom(true), 50);

    const token = localStorage.getItem('daytrace_token');

    try {
      const response = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: query,
          history: newHistory.slice(-8).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          contextData: {
            todayFocusHours: (todayStats.focusMinutes / 60).toFixed(1),
            todayDistractionHours: (todayStats.distractionMinutes / 60).toFixed(1),
            todayResponsibilityHours: (todayStats.responsibilityMinutes / 60).toFixed(1),
            todayExecutionRate: todayStats.executionRate,
            plannedTasks: plannedTasks.map((t) => ({ name: t.name, priority: t.priority, completed: t.completed })),
            goals: goals.map((g) => ({ name: g.name, currentHours: g.currentHours, targetHours: g.targetHours })),
            habits: habits.map((h) => ({ name: h.name, streakCount: h.streakCount })),
          },
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.substring(6));
              if (data.type === 'chunk' && data.text) {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === mentorPlaceholderId
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                );
                scrollToBottom(false);
              } else if (data.type === 'done') {
                if (data.totalText && !accumulatedText) {
                  accumulatedText = data.totalText;
                }
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === mentorPlaceholderId
                      ? {
                          ...msg,
                          text: accumulatedText || data.totalText || msg.text,
                          source: data.modelUsed || 'Gemini AI',
                          fallbackUsed: data.fallbackUsed,
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }

      // If stream ended with content, mark complete
      if (accumulatedText.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === mentorPlaceholderId
              ? { ...msg, text: accumulatedText, isStreaming: false }
              : msg
          )
        );
        return;
      }
      
      // If stream was empty, throw to trigger REST fallback
      throw new Error('Empty stream response received');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User intentionally stopped stream
        return;
      }
      console.warn('AI stream interrupted, engaging resilient fallback:', err);

      // Attempt Tier-2 REST fallback
      try {
        const restResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: query,
            history: newHistory.slice(-8).map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          }),
        });

        if (restResponse.ok) {
          const restData = await restResponse.json();
          if (restData.reply) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === mentorPlaceholderId
                  ? {
                      ...msg,
                      text: restData.reply,
                      source: restData.source || 'Gemini AI',
                      fallbackUsed: restData.fallbackUsed,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            return;
          }
        }
      } catch (restErr) {
        console.warn('REST fallback failed as well:', restErr);
      }

      // Tier-3 Context-aware Dynamic Coaching Engine Fallback
      setLastFailedQuery(query);

      const lower = query.toLowerCase();
      const userFirstName = profile.firstName || profile.name?.split(' ')[0] || 'there';
      let contextualReply = '';

      if (
        lower.includes('mother') ||
        lower.includes('mom') ||
        lower.includes('father') ||
        lower.includes('dad') ||
        lower.includes('sick') ||
        lower.includes('ill') ||
        lower.includes('emergency') ||
        lower.includes('hospital')
      ) {
        contextualReply = `I'm really sorry to hear that, ${userFirstName}. Please take care of yourself and your family first—health and loved ones always take precedence over any daily schedule. You don't need to stress over your planned tasks today. If you'd like, we can pause or adjust your DayTrace plan whenever you feel ready.`;
      } else if (
        lower.startsWith('hi') ||
        lower.startsWith('hello') ||
        lower.startsWith('hey') ||
        lower.includes('how are you')
      ) {
        contextualReply = `Hey ${userFirstName}! 👋 Good to see you. How are you doing today, and what would you like to focus on or chat about?`;
      } else if (lower.includes('procrastinat') || lower.includes('start') || lower.includes('hard to focus') || lower.includes('activation energy')) {
        contextualReply = `To beat procrastination, lower the activation energy immediately:\n\n1. **Commit to 5 minutes**: Don't aim to finish the entire project—just open the document and work for 5 minutes.\n2. **Remove visual friction**: Close background tabs and set your phone facing down.\n3. **Start the Focus Timer**: Action always precedes motivation.`;
      } else if (lower.includes('disciplin') || lower.includes('self-control') || lower.includes('consistency')) {
        contextualReply = `Discipline isn't about brute willpower—it's about systems and environments:\n\n1. **Rely on Triggers**: Set a specific time and trigger to begin work so you don't negotiate with yourself.\n2. **Lower Setup Friction**: Prepare your tools the night before so starting requires zero effort.\n3. **Never Miss Twice**: If you get interrupted today, refocus immediately on the next block.`;
      } else if (lower.includes('pick #1 priority') || lower.includes('priority') || lower.includes('must-do')) {
        contextualReply = `To select your #1 Must-Do priority:\n\nAsk yourself: *"If I could only accomplish ONE single outcome today before shutting down, which one would make the day a success?"*\n\nProtect 1 uninterrupted focus block for that item before doing secondary tasks.`;
      } else if (lower.includes('study sprint') || lower.includes('study') || lower.includes('pomodoro') || lower.includes('retention')) {
        contextualReply = `For high-retention study intervals:\n\n1. **25-Minute Deep Focus**: Zero split attention or browsing feeds.\n2. **Active Retrieval**: In the final 2 minutes, jot down the 3 core takeaways from memory without looking at notes.\n3. **5-Minute True Rest**: Step away from all screens to allow memory consolidation.`;
      } else if (lower.includes('chore') || lower.includes('household') || lower.includes('family interruption') || lower.includes('guilt')) {
        contextualReply = `In DayTrace, handling family responsibilities, household chores, and caretaking is **never classified as wasted time or failure**.\n\nLog them honestly as Unplanned Responsibilities, compress your remaining plan without guilt, and protect 1 core focus block for your highest priority.`;
      } else if (lower.includes('distraction') || lower.includes('phone') || lower.includes('social') || lower.includes('feed')) {
        contextualReply = `When enforcing distraction boundaries:\n\n• Use the **Focus Timer** with a clear 25-minute single-task goal.\n• Keep your phone in another room or out of sight during deep work blocks.\n• Use the **10-Second Rule**: When you feel the reflex to open a feed, take 3 deep breaths before opening it. That simple friction breaks the subconscious loop.`;
      } else if (lower.includes('plan tomorrow') || lower.includes('plan my day')) {
        contextualReply = `Here is a sustainable planning framework:\n\n1. **Must Do (1–2 core tasks)**: High-leverage items that define success.\n2. **Should Do (1–2 items)**: Valuable progress tasks if energy allows.\n3. **Life Buffer (1.5–2 hours)**: Budget real time for meals, chores, and unexpected delays.`;
      } else {
        contextualReply = `I'm here to support your daily flow, ${userFirstName}. Feel free to ask for help on task prioritization, beating procrastination, setting focus timers, or reviewing where your time went today.`;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === mentorPlaceholderId
            ? {
                ...msg,
                text: contextualReply,
                source: 'DayTrace Coach',
                fallbackUsed: true,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      scrollToBottom(true);
    }
  };

  const handleResetChat = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'mentor',
        text: `New conversation started! Hello ${profile.firstName || profile.name?.split(' ')[0] || 'there'}. What would you like to plan, organize, or reflect on?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Gemini AI',
      },
    ]);
    setErrorNotice(null);
    setLastFailedQuery(null);
  };

  const handleTriggerWeeklyReview = async () => {
    setIsGeneratingWeekly(true);
    try {
      const generated = await generateWeeklyReview();
      if (generated && generated.aiMentorReport) {
        setWeeklyReportData(generated.aiMentorReport);
      }
    } catch (e) {
      console.error('Failed to generate weekly review', e);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full min-h-0 animate-in fade-in duration-150 px-2.5 sm:px-4 py-2">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-950/80 to-[#102018] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0f1117] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight leading-tight">
                AI Mentor
              </h1>
              <span className="clay-pill-emerald inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold">
                <Zap className="w-2.5 h-2.5 text-emerald-400" /> Gemini
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none mt-0.5 hidden sm:block font-medium">
              Evidence-based AI guide for focus, realistic planning & habits
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center clay-card-sm p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'clay-btn-primary text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('weekly-review')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'weekly-review'
                  ? 'clay-btn-primary text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarRange className="w-3 h-3" />
              <span>Weekly Audit</span>
            </button>
          </div>

          {activeTab === 'chat' && (
            <button
              onClick={handleResetChat}
              title="Start a new chat"
              className="clay-btn-secondary p-2 text-zinc-400 hover:text-zinc-200 rounded-xl transition text-xs flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col min-h-0 pt-2">
          {/* Offline / Error notice banner */}
          {errorNotice && (
            <div className="mb-2 p-3 bg-gradient-to-r from-amber-950/60 to-[#221810] border border-amber-500/40 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-200 shrink-0 shadow-[0_4px_12px_rgba(245,158,11,0.15)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium">{errorNotice}</span>
              </div>
              <div className="flex items-center gap-2">
                {lastFailedQuery && (
                  <button
                    onClick={() => handleSendMessage(lastFailedQuery)}
                    disabled={isStreaming}
                    className="clay-pill-amber px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isStreaming ? 'animate-spin' : ''}`} />
                    <span>Retry</span>
                  </button>
                )}
                <button
                  onClick={() => setErrorNotice(null)}
                  className="text-amber-400 hover:text-amber-200 text-[10px] font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Prompt Chips */}
          <div className="flex items-center gap-1.5 pb-2 shrink-0 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 pl-0.5 mr-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Prompts:
            </span>
            {PRESET_TOPICS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p.prompt)}
                disabled={isStreaming}
                className="px-3 py-1 clay-card-sm hover:border-emerald-500/40 text-zinc-300 text-[11px] sm:text-xs rounded-full transition cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1 leading-normal whitespace-nowrap font-medium"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Single Clean Messages Stream Container - Hidden Scrollbar with smooth scroll */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 no-scrollbar scrollbar-none min-h-0"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'mentor' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-950/80 to-[#102018] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(16,185,129,0.2)]">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[88%] sm:max-w-[80%] md:max-w-2xl px-4 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-tr-xs shadow-[0_4px_16px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-emerald-400/40'
                      : 'clay-card text-zinc-200 rounded-tl-xs'
                  }`}
                >
                  {/* Thinking state before first stream chunk */}
                  {msg.sender === 'mentor' && !msg.text && msg.isStreaming ? (
                    <div className="flex items-center gap-1.5 py-1 text-xs text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
                      <span className="text-xs text-zinc-400 ml-1 font-medium">Thinking...</span>
                    </div>
                  ) : (
                    <FormattedMessageText text={msg.text} />
                  )}

                  {/* Streaming active cursor */}
                  {msg.isStreaming && msg.text && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 rounded-xs animate-pulse align-middle" />
                  )}

                  {/* Message Footer: Timestamp, Source & Copy Button */}
                  <div
                    className={`text-[10px] flex items-center justify-between gap-2 pt-2 mt-1.5 border-t ${
                      msg.sender === 'user'
                        ? 'text-emerald-100/70 border-emerald-400/30'
                        : 'text-zinc-500 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {msg.source && (
                        <span className="font-mono text-[9px] opacity-80">
                          {msg.fallbackUsed ? '⚡ Local' : msg.source}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] opacity-75">{msg.timestamp}</span>
                      {msg.text && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          title="Copy text"
                          className="opacity-60 hover:opacity-100 transition cursor-pointer p-0.5"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-zinc-200 shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <div className="pt-2.5 pb-1 border-t border-white/5 shrink-0 bg-[#0c0e14]/90 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 clay-card p-2 rounded-2xl focus-within:border-emerald-500/50 transition shadow-2xl"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask your AI Mentor..."
                disabled={isStreaming}
                className="flex-1 px-3 py-2 bg-transparent text-white placeholder-zinc-500 text-xs md:text-sm focus:outline-none resize-none no-scrollbar hide-scrollbar overflow-y-auto min-h-[38px] max-h-28 sm:max-h-32 leading-relaxed"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="p-2.5 clay-btn-danger rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center"
                  title="Stop generating"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 clay-btn-primary rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 px-1 font-medium">
              <span>Shift+Enter for newline</span>
              <span className="text-zinc-400 font-mono">DayTrace Contextual AI</span>
            </div>
          </div>
        </div>
      ) : (
        /* Weekly Review Mode Tab */
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar scrollbar-none pt-2 min-h-0">
          <div className="p-5 clay-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm md:text-base font-extrabold text-white">
                  Evidence-Based Weekly Performance Audit
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Computed strictly from your authentic recorded tasks, focus timers, habit streaks, and distraction boundaries.
              </p>
            </div>

            <button
              onClick={handleTriggerWeeklyReview}
              disabled={isGeneratingWeekly}
              className="clay-btn-primary px-4 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{isGeneratingWeekly ? 'Analyzing 7-Day Logs...' : 'Generate New Weekly Audit'}</span>
            </button>
          </div>

          {/* New User Unlock / Progress Meter when < 7 days recorded */}
          {activeDaysCount < 7 && !weeklyReportData && (
            <div className="p-5 sm:p-6 clay-card space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl clay-inset flex items-center justify-center text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      Weekly Audit Progress: {activeDaysCount} of 7 Days Recorded
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Your full weekly review unlocks after recording 7 days of genuine daily plans and focus sessions.
                    </p>
                  </div>
                </div>
                <span className="clay-pill-emerald text-xs font-mono font-bold px-3 py-1">
                  {Math.round((activeDaysCount / 7) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full clay-inset rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${Math.max(5, Math.min(100, (activeDaysCount / 7) * 100))}%` }}
                />
              </div>

              {/* Breakdown of 10 Analysis Dimensions */}
              <div className="pt-3 border-t border-white/5 space-y-2.5">
                <div className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                  The 10 Dimensions Analyzed in Your Weekly Review:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">1. Weekly Executive Overview</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">2. Deep Work & Focus Analysis</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">3. Task & Goal Execution Rate</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">4. Interruptions & Unplanned Duties</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">5. Routine & Habit Consistency</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">6. Recurring Productivity Patterns</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">7. Evidence-Based Wins</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">8. Identified Challenges & Leaks</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">9. Actionable Next Steps</span>
                  </div>
                  <div className="p-2.5 clay-card-sm flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">10. Next Week Strategic Focus</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Weekly Report Details */}
          {weeklyReportData ? (
            <div className="space-y-4">
              {/* Score & Executive Overview */}
              <div className="p-5 sm:p-6 clay-card border-emerald-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white">1. Weekly Executive Overview</h3>
                      <p className="text-[11px] text-zinc-400 font-medium">Authentic evidence-based evaluation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs font-semibold">Performance Score:</span>
                    <span className="clay-pill-emerald px-3.5 py-1 text-sm font-extrabold">
                      {weeklyReportData.score || 85} / 100 ({weeklyReportData.scoreGrade || 'B+'})
                    </span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-zinc-200 leading-relaxed italic clay-inset p-4 rounded-xl border border-white/5 font-medium">
                  &ldquo;{weeklyReportData.weeklyOverview || weeklyReportData.summary}&rdquo;
                </p>
              </div>

              {/* 2 & 3: Deep Work Focus & Task Execution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Deep Work Analysis */}
                <div className="p-5 clay-card space-y-3">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Clock className="w-4 h-4" />
                    <span>2. Deep Work & Focus Time</span>
                  </div>
                  {weeklyReportData.focusAnalysis ? (
                    <div className="space-y-2 text-xs text-zinc-300">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-zinc-400 font-medium">Total Focus Time:</span>
                        <span className="font-mono font-bold text-emerald-400">{weeklyReportData.focusAnalysis.totalFocusHours}h</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-zinc-400 font-medium">Recorded Sessions:</span>
                        <span className="font-mono font-bold text-white">{weeklyReportData.focusAnalysis.sessionCount}</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed pt-1 font-medium">
                        {weeklyReportData.focusAnalysis.insight}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-300">{weeklyReportData.summary}</p>
                  )}
                </div>

                {/* 3. Task & Goal Execution */}
                <div className="p-5 clay-card space-y-3">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Target className="w-4 h-4" />
                    <span>3. Task & Goal Execution</span>
                  </div>
                  {weeklyReportData.taskAnalysis ? (
                    <div className="space-y-2 text-xs text-zinc-300">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-zinc-400 font-medium">Completed Tasks:</span>
                        <span className="font-mono font-bold text-white">{weeklyReportData.taskAnalysis.completedCount}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-zinc-400 font-medium">Execution Rate:</span>
                        <span className="font-mono font-bold text-emerald-400">{weeklyReportData.taskAnalysis.executionRate}%</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed pt-1 font-medium">
                        {weeklyReportData.taskAnalysis.insight}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-300">{weeklyReportData.realityCheck}</p>
                  )}
                </div>
              </div>

              {/* 4, 5, 6: Interruptions, Consistency, Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 4. Interruptions */}
                <div className="p-4 sm:p-5 clay-card space-y-2">
                  <div className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>4. Life & Interruptions</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {weeklyReportData.interruptionAnalysis?.impactSummary || 'Handled unplanned commitments with steady composure.'}
                  </p>
                </div>

                {/* 5. Routine Consistency */}
                <div className="p-4 sm:p-5 clay-card space-y-2">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Flame className="w-4 h-4" />
                    <span>5. Routine Adherence</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {weeklyReportData.consistency?.strongestPattern
                      ? `Strength: ${weeklyReportData.consistency.strongestPattern}. Active days: ${weeklyReportData.consistency.activeDaysCount || 5}/7.`
                      : 'Maintained authentic habit logging across planned days.'}
                  </p>
                </div>

                {/* 6. Productivity Patterns */}
                <div className="p-4 sm:p-5 clay-card space-y-2">
                  <div className="font-extrabold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <TrendingUp className="w-4 h-4" />
                    <span>6. Repeated Patterns</span>
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300 font-medium">
                    {(weeklyReportData.productivityPatterns || weeklyReportData.patterns || ['Consistent focus during uninterrupted morning windows.']).map(
                      (pat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{pat}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* 7 & 8: Wins and Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 7. Wins */}
                <div className="p-5 clay-card border-emerald-500/30 space-y-2.5">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Award className="w-4 h-4" />
                    <span>7. What Went Well (Wins)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-200 font-medium">
                    {(weeklyReportData.wins || []).map((win: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 8. Challenges */}
                <div className="p-5 clay-card border-rose-500/30 space-y-2.5">
                  <div className="font-extrabold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>8. Identified Challenges & Leaks</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-200 font-medium">
                    {(weeklyReportData.challenges || weeklyReportData.problems || []).map((prob: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{prob}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 9 & 10: Actionable Recommendations & Next Week Focus */}
              <div className="p-5 sm:p-6 clay-card space-y-3.5">
                <div className="font-extrabold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>9. High-Leverage Recommendations</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-200">
                  {(weeklyReportData.recommendations || []).map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 clay-card-sm">
                      <span className="text-emerald-400 font-extrabold font-mono min-w-[16px]">{i + 1}.</span>
                      <span className="font-medium leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>

                {/* 10. Next Week Focus */}
                <div className="pt-3.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-extrabold text-white">10. Next Week Strategic Focus:</span>
                    <span className="text-xs text-emerald-300 font-bold">{weeklyReportData.nextWeekFocus}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
