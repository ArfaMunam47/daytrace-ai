/**
 * DayTrace AI Mentor Engine — Conversational Intelligence & Grounded Analytics
 * 
 * Implements:
 * 1. Natural conversation first (greetings, life situations, reflections, learning)
 * 2. Multi-turn dialogue memory & direct answers to user replies
 * 3. Human empathy for personal emergencies, sickness, and family responsibilities
 * 4. Grounded, authentic DayTrace data integration ONLY when relevant or explicitly requested
 * 5. Role-aware intelligence (Student, Professional, Builder/Developer, Creator, etc.)
 * 6. 10-Point Evidence-Based Weekly Review generator with deterministic fallbacks
 */

export interface MentorUserContext {
  userId: string;
  userName: string;
  userFirstName: string;
  occupation: string;
  dailyCapacityHours: number;
  todayStr: string;
  currentView?: string;
  todayTasks: Array<{ name: string; priority: string; estimatedMinutes?: number; completed: boolean; category?: string }>;
  todayLogs: Array<{ category: string; durationMinutes: number; name?: string; isInterruption?: boolean }>;
  activeGoals: Array<{ name: string; currentHours: number; targetHours: number; category?: string }>;
  activeHabits: Array<{ name: string; streakCount: number }>;
  weeklyReviews?: any[];
}

export function buildMentorSystemInstruction(ctx: MentorUserContext): string {
  const completedCount = ctx.todayTasks.filter((t) => t.completed).length;
  const totalTasks = ctx.todayTasks.length;
  const executionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const focusMinutes = ctx.todayLogs
    .filter((l) => ['DEEP_WORK', 'CREATIVE', 'LEARNING', 'ADMIN', 'HEALTH', 'PRODUCTIVE'].includes(l.category) && !l.isInterruption)
    .reduce((acc, l) => acc + (Number(l.durationMinutes) || 0), 0);

  const distractionMinutes = ctx.todayLogs
    .filter((l) => l.category === 'DISTRACTION' || l.category === 'ENTERTAINMENT')
    .reduce((acc, l) => acc + (Number(l.durationMinutes) || 0), 0);

  const responsibilityMinutes = ctx.todayLogs
    .filter((l) => l.category === 'UNPLANNED_RESPONSIBILITY' || l.category === 'FAMILY' || l.category === 'CHORES' || l.isInterruption)
    .reduce((acc, l) => acc + (Number(l.durationMinutes) || 0), 0);

  const tasksSummary =
    ctx.todayTasks.length > 0
      ? ctx.todayTasks.map((t) => `"${t.name}" [${t.priority}, ${t.estimatedMinutes || 45}m, ${t.completed ? 'Completed' : 'Pending'}]`).join(', ')
      : 'No planned tasks yet';

  const goalsSummary =
    ctx.activeGoals.length > 0
      ? ctx.activeGoals.map((g) => `"${g.name}" (${g.currentHours}/${g.targetHours}h)`).join(', ')
      : 'None created yet';

  const habitsSummary =
    ctx.activeHabits.length > 0
      ? ctx.activeHabits.map((h) => `"${h.name}" (${h.streakCount} day streak)`).join(', ')
      : 'None created yet';

  const role = (ctx.occupation || 'Professional / Student').toLowerCase();
  let roleGuidance = '';
  if (role.includes('student') || role.includes('study') || role.includes('academic') || role.includes('learner')) {
    roleGuidance = 'ROLE FOCUS (STUDENT): Focus on study consistency, assignments, exam preparation, learning sessions, cognitive retention, and preventing last-minute burnout.';
  } else if (role.includes('builder') || role.includes('dev') || role.includes('engineer') || role.includes('coder') || role.includes('software')) {
    roleGuidance = 'ROLE FOCUS (BUILDER / DEVELOPER): Focus on uninterrupted deep work blocks, building sessions, project milestones, code architecture clarity, and tackling complex technical roadblocks.';
  } else if (role.includes('creator') || role.includes('writer') || role.includes('designer') || role.includes('artist')) {
    roleGuidance = 'ROLE FOCUS (CREATOR): Focus on creative momentum, overcoming blank-canvas inertia, shipping deliverables, and separating creative deep work from administrative clutter.';
  } else {
    roleGuidance = 'ROLE FOCUS (PROFESSIONAL): Focus on high-leverage work priorities, meeting/interruption triage, realistic daily execution, and healthy boundary management.';
  }

  return `You are DayTrace AI Mentor, an intelligent, empathetic, supportive, and practical productivity mentor.
You are conversing directly with ${ctx.userName} (First name: ${ctx.userFirstName}).

${roleGuidance}

==================================================
CORE CONVERSATIONAL PRINCIPLES:
==================================================

1. LISTEN TO WHAT THE USER ACTUALLY SAID:
   - Understand the user's explicit message and respond directly to their specific question, problem, or emotion.
   - For simple greetings or check-ins (e.g. "Hello", "Hi", "Hey", "How are you?"): Reply warmly, concisely, and conversationally in 1-2 friendly sentences. Do NOT dump database metrics or statistics for casual greetings.
   - For day review inquiries (e.g. "How was my day?", "How did I do today?"): Reference ONLY the real recorded data below. If 0 tasks and 0 focus hours are recorded, state honestly: "No activity has been recorded yet today," and invite them to plan. Never fabricate numbers.
   - For unfinished tasks or setbacks (e.g. "I couldn't finish my tasks today", "I fell behind"): Acknowledge that real life happens, reassure them that an unfinished task is NOT a failure, and help them prioritize or move items to tomorrow without guilt.
   - If the user talks about a personal situation (e.g. "My mother is sick and I couldn't complete my planned work today", "I had a family emergency", "I am feeling exhausted"): RESPOND WITH GENUINE HUMAN EMPATHY FIRST. In DayTrace, personal well-being, family care, and real-life emergencies ALWAYS take precedence over any schedule.
   - If the user says "I wasted the entire afternoon", help them understand why without judging (e.g., fatigue, task ambiguity, or lack of boundaries) and suggest ONE small, low-pressure next step.
   - If the user says "I have an exam tomorrow and I'm behind", help them triage and prioritize only the highest-impact topics realistically.
   - If the user says "Help me plan tomorrow" or "How should I plan tomorrow?", provide a clear, realistic 3-tier structure (Must-Do, Should-Do, Buffer) tailored to their role.

2. AVOID UNRELATED BOILERPLATE:
   - DO NOT automatically dump productivity statistics or screen metrics unless the user explicitly asks for them or they are directly relevant to their question.
   - NEVER start responses with generic clichés like "Looking at your recorded focus today..." or "As your DayTrace mentor...".
   - NEVER end every turn with repetitive robotic sign-offs like "What is your immediate next step?". Keep follow-ups natural and conversational.

3. MULTI-TURN CONTEXT & MEMORY:
   - Remember the conversational context. When the user answers your questions or refers to past topics ("Coursera", "my exam", "the bug"), respond directly and maintain continuity.

4. OBJECTIVE, HONEST & ACTIONABLE:
   - Provide constructive, realistic advice. No fake cheerleading, no shaming.
   - If suggesting an in-app action, you may optionally include functional action chips:
     - \`[action:plan-tomorrow|Plan Tomorrow]\`
     - \`[action:weekly-review|Review My Week]\`
     - \`[action:focus|Start Focus Session]\`
     - \`[action:goals-projects|View Goals]\`
     - \`[action:dashboard|Today's Plan]\`
     - \`[action:habits|Habits & Streaks]\`

==================================================
AUTHENTIC USER BACKGROUND CONTEXT:
==================================================
- User: ${ctx.userName} (${ctx.userFirstName})
- Role: ${ctx.occupation}
- Daily Capacity Target: ${ctx.dailyCapacityHours}h
- Today's Date: ${ctx.todayStr}
- Today's Focus: ${(focusMinutes / 60).toFixed(1)}h (${focusMinutes}m)
- Today's Distractions: ${(distractionMinutes / 60).toFixed(1)}h (${distractionMinutes}m)
- Today's Unplanned Responsibilities: ${(responsibilityMinutes / 60).toFixed(1)}h (${responsibilityMinutes}m)
- Today's Tasks: ${completedCount}/${totalTasks} completed (${executionRate}%)
- Planned Tasks: ${tasksSummary}
- Active Goals: ${goalsSummary}
- Habits: ${habitsSummary}`;
}

/**
 * Formats multi-turn chat history into a clean dialogue structure.
 */
export function formatConversationPrompt(
  history: Array<{ sender?: string; role?: string; text?: string; content?: string }>,
  currentMessage: string
): string {
  if (!Array.isArray(history) || history.length === 0) {
    return currentMessage.trim();
  }

  const cleanTurns = history
    .filter((h) => (h.text || h.content || '').trim().length > 0)
    .slice(-10);

  if (cleanTurns.length === 0) {
    return currentMessage.trim();
  }

  const dialogueLines = cleanTurns.map((turn) => {
    const isUser = turn.sender === 'user' || turn.role === 'user';
    const speaker = isUser ? 'User' : 'Mentor';
    const text = (turn.text || turn.content || '').trim();
    return `${speaker}: ${text}`;
  });

  return `Conversation History:
${dialogueLines.join('\n\n')}

User: ${currentMessage.trim()}
Mentor:`;
}

/**
 * Intelligent, context-aware deterministic fallback when AI provider is offline or cooling down.
 */
export function generateNaturalFallbackReply(
  message: string,
  history: Array<{ sender?: string; role?: string; text?: string; content?: string }>,
  ctx: MentorUserContext
): string {
  const lower = message.toLowerCase().trim();
  const name = ctx.userFirstName || 'there';
  const role = (ctx.occupation || 'Professional').toLowerCase();

  // 1. Personal / Family Sickness / Emergencies / Distress
  if (
    lower.includes('mother') ||
    lower.includes('mom') ||
    lower.includes('father') ||
    lower.includes('dad') ||
    lower.includes('sick') ||
    lower.includes('ill') ||
    lower.includes('hospital') ||
    lower.includes('emergency') ||
    lower.includes('family') ||
    lower.includes('grief') ||
    lower.includes('passed away')
  ) {
    return `I'm really sorry to hear that, ${name}. Please take care of your family and yourself first—health and loved ones always take precedence over any daily schedule or to-do list.

You don't need to stress over unfinished tasks today. Days like this are what real life is about, and in DayTrace, handling family responsibilities is never a failure. Whenever you are ready, we can gently adjust your plan.`;
  }

  // 2. "I wasted the afternoon / procrastinated / lost focus / beat procrastination"
  if (
    lower.includes('wasted') ||
    lower.includes('procrastinat') ||
    lower.includes('lost my afternoon') ||
    lower.includes('did nothing') ||
    lower.includes('scrolling') ||
    lower.includes('lazy') ||
    lower.includes('activation energy') ||
    lower.includes('start my next priority')
  ) {
    return `To beat procrastination, lower the activation energy immediately, ${name}:

1. **Commit to 5 Minutes**: Don't aim to finish the entire project—just open the file or workspace and work for 5 minutes. If you want to stop after 5 minutes, you have full permission.
2. **Remove Visual Friction**: Close extraneous browser tabs and turn your phone face-down away from your immediate eyesight.
3. **Start a Focus Sprint**: Action always precedes motivation.

What is one tiny 2-minute step you can take right this second to get moving?`;
  }

  // 2b. "Be disciplined / stay disciplined / build discipline"
  if (
    lower.includes('disciplin') ||
    lower.includes('self-control') ||
    lower.includes('willpower') ||
    lower.includes('stay consistent') ||
    lower.includes('consistency')
  ) {
    return `Discipline isn't about brute willpower, ${name}—it's about building an environment where doing the right thing is the path of least resistance:

1. **Rely on Systems, Not Mood**: Motivation is an emotion that fluctuates daily. A defined trigger (e.g. "At 9:30 AM, open DayTrace and start Timer") removes the need to negotiate with yourself.
2. **Lower Task Friction**: Prepare your tools and documents the night before so starting requires zero setup effort.
3. **Never Miss Twice**: If you miss a focus session or get interrupted today, don't spiral. The definition of high discipline is rebounding immediately on the next block.

Which specific habit or task do you want to anchor today?`;
  }

  // 2c. "Pick #1 Priority / prioritization"
  if (
    lower.includes('pick #1 priority') ||
    lower.includes('pick priority') ||
    lower.includes('must-do') ||
    lower.includes('what to prioritize') ||
    lower.includes('highest priority') ||
    lower.includes('select my single')
  ) {
    const uncompletedTasks = ctx.todayTasks.filter((t) => !t.completed);
    if (uncompletedTasks.length > 0) {
      const topTask = uncompletedTasks.find((t) => t.priority === 'HIGH' || t.priority === 'MUST_DO') || uncompletedTasks[0];
      return `Looking at your plan today, ${name}, your clear #1 Must-Do focus block should be:

🎯 **"${topTask.name}"** (${topTask.estimatedMinutes || 45} min)

When you protect 1 solid block of deep focus for this task, your day is already a concrete win regardless of minor interruptions later. Shall we start a focus timer on it?`;
    }

    return `To identify your #1 priority, ask this filtering question, ${name}:

*"If I could only accomplish ONE single outcome today before shutting down my laptop, which one would make the entire day a success?"*

Pick that one task, designate it as your Must-Do block, and defer secondary administrative tasks until it is completed. What task comes to mind?`;
  }

  // 2d. "Deep Study Sprints / Study intervals"
  if (
    lower.includes('study sprint') ||
    lower.includes('study interval') ||
    lower.includes('25-minute') ||
    lower.includes('study intervals') ||
    lower.includes('maximize retention') ||
    lower.includes('pomodoro')
  ) {
    return `Here is how to optimize your study sprints for maximum retention, ${name}:

1. **25-Minute High-Intensity Focus**: Study with zero split attention. No messaging apps, background audio with lyrics, or casual feed checking.
2. **Active Retrieval at the End**: In the last 2 minutes, close your notes and quickly jot down the 3 core takeaways from memory.
3. **5-Minute Cognitive Rest**: Step away from all screens during the break. Stretch, drink water, or look out a window to let memory consolidation occur.

Would you like to start a 25-minute Deep Study timer now?`;
  }

  // 2e. "Household & Life / Chores / Unplanned Responsibilities"
  if (
    lower.includes('chore') ||
    lower.includes('household') ||
    lower.includes('family interruption') ||
    lower.includes('without guilt') ||
    lower.includes('errand') ||
    lower.includes('unplanned responsibility')
  ) {
    return `In DayTrace, handling family responsibilities, household chores, and caretaking is **never classified as wasted time or failure**, ${name}.

Real human life requires care and maintenance. When interruptions occur:
1. **Log them honestly as Unplanned Responsibilities**: Acknowledge the real effort you expended.
2. **Compress your remaining plan**: Drop low-leverage optional tasks without guilt.
3. **Protect 1 core focus block**: Even 30 minutes of deep focus is enough to preserve your daily momentum.

You handled what was necessary—now let's adjust the rest of your evening smoothly.`;
  }

  // 2f. "Distraction boundaries / Social media"
  if (
    lower.includes('distraction boundar') ||
    lower.includes('social media') ||
    lower.includes('limit feeds') ||
    lower.includes('scrolling feed') ||
    lower.includes('screen time') ||
    lower.includes('phone limits')
  ) {
    return `Here is a pragmatic strategy to enforce distraction boundaries without relying on impossible willpower, ${name}:

1. **Create Physical Distance**: Place your phone in another room or inside a drawer during deep work blocks.
2. **Designate Intentional Windows**: Rather than trying to quit cold-turkey, schedule a dedicated 15-minute relaxation window after completing a core focus block.
3. **Use the 10-Second Pause Rule**: When you feel the reflex to open a feed or browser tab, pause and take 3 deep breaths before opening it. That simple friction breaks the subconscious loop.

What is the primary distraction app you want to set a boundary for today?`;
  }

  // 3. "Exam tomorrow / behind / urgent deadline"
  if (
    lower.includes('exam') ||
    lower.includes('test') ||
    lower.includes('behind') ||
    lower.includes('deadline tomorrow') ||
    lower.includes('panicking')
  ) {
    if (role.includes('student')) {
      return `Take a steady breath, ${name}. When you are behind before an exam, trying to learn everything creates panic. Let's triage:

1. **High-Yield Concepts Only**: Focus strictly on past exams, high-weight formula sheets, and core lecture summaries.
2. **Active Recall over Passive Reading**: Test yourself on key problems rather than passively re-reading slides.
3. **Protect at least 6 hours of sleep**: Sleep is non-negotiable for memory consolidation and problem-solving tomorrow.

What is the single most critical topic on the syllabus right now?`;
    }

    return `Let's triage immediately, ${name}:
1. **Identify the absolute MVP**: What is the minimum essential deliverable needed for tomorrow?
2. **Cut non-essential polish**: Strip away secondary formatting or optional extras.
3. **Execute in 40-minute sprints**: Work in focused blocks with 5-minute pauses.

What is the core blocker standing between you and the deliverable?`;
  }

  // 4. Greetings & Casual Openings
  if (
    lower === 'hello' ||
    lower === 'hi' ||
    lower === 'hey' ||
    lower.startsWith('hello ') ||
    lower.startsWith('hi ') ||
    lower.startsWith('hey ') ||
    lower === 'good morning' ||
    lower === 'good afternoon' ||
    lower === 'good evening' ||
    lower === 'how are you' ||
    lower === 'how are you?' ||
    lower === "how's it going" ||
    lower === "what's up"
  ) {
    return `Hey ${name}! 👋 Good to see you. How are you doing today, and what would you like to focus on or chat about?`;
  }

  // 5. Casual Conversation / Brainstorming / "Can we talk?"
  if (
    lower.includes('can we talk') ||
    lower.includes('just talk') ||
    lower.includes('brainstorm') ||
    lower.includes('chat with me')
  ) {
    return `Of course! I'm here for whatever you'd like to explore—whether that's talking through a project, brainstorming ideas, managing workload, or just decompressing. What's on your mind?`;
  }

  // 6. Explicit Planning Request
  if (
    lower.includes('plan my day') ||
    lower.includes('plan tomorrow') ||
    lower.includes('help me plan') ||
    lower.includes('what should i do') ||
    lower.includes('how to plan')
  ) {
    return `Here is a sustainable planning framework for tomorrow, ${name}:

1. **Must Do (1–2 core priorities)**: The high-leverage items that define success.
2. **Should Do (1–2 items)**: Valuable progress tasks if energy and time allow.
3. **Life Buffer (1.5–2 hours)**: Budget real time for meals, chores, and unexpected delays.

What are the top 1 or 2 outcomes that matter most to you tomorrow?`;
  }

  // 7. Explicit Daily Review Request
  if (
    lower.includes('review my day') ||
    lower.includes('review today') ||
    lower.includes('how did i do today') ||
    lower.includes('daily audit')
  ) {
    const focusHours = (
      ctx.todayLogs
        .filter((l) => ['DEEP_WORK', 'CREATIVE', 'LEARNING', 'ADMIN', 'HEALTH', 'PRODUCTIVE'].includes(l.category) && !l.isInterruption)
        .reduce((acc, l) => acc + (Number(l.durationMinutes) || 0), 0) / 60
    ).toFixed(1);

    const completed = ctx.todayTasks.filter((t) => t.completed).length;
    const total = ctx.todayTasks.length;

    if (total === 0 && Number(focusHours) === 0) {
      return `Here is your honest snapshot for today:\n\n• **Planned Tasks**: No tasks scheduled.\n• **Recorded Focus**: 0.0 hours logged.\n\nYou have a clean slate. Would you like to set 1-2 priorities for tomorrow?`;
    }

    return `Here is your daily reflection for ${ctx.todayStr}:\n\n• **Focus Logged**: ${focusHours}h of deep work.\n• **Tasks Completed**: ${completed} of ${total} planned tasks.\n\nAcknowledge what you handled today, including real-life interruptions. Would you like to plan tomorrow now?`;
  }

  // 8. Overwhelm / Stuck
  if (
    lower.includes('overwhelm') ||
    lower.includes('stuck') ||
    lower.includes('confused') ||
    lower.includes('too much work') ||
    lower.includes('burnout')
  ) {
    return `When everything feels urgent, nothing is clear. Let's simplify:\n\n1. Write down everything swirling in your head.\n2. Pick just ONE item to address right now.\n3. Put everything else on pause.\n\nWhat is the single thing creating the most friction right now?`;
  }

  // 9. Gratitude / Closure
  if (
    lower === 'thanks' ||
    lower === 'thank you' ||
    lower === 'thanks!' ||
    lower === 'thank you!' ||
    lower === 'got it' ||
    lower === 'awesome' ||
    lower === 'great'
  ) {
    return `You're very welcome, ${name}! 😊 Keep building steady consistency, and feel free to reach out anytime.`;
  }

  // 10. Natural Default
  return `I hear you, ${name}. Tell me a bit more about what you're experiencing or working through, and let's tackle it together.`;
}

/**
 * Weekly Review 10-Point System Instruction Builder
 */
export function buildWeeklyReviewSystemInstruction(profile: { name: string; occupation: string; goals?: string[] }): string {
  const role = (profile.occupation || 'Professional / Student').toLowerCase();
  let roleContext = '';
  if (role.includes('student') || role.includes('academic') || role.includes('learner')) {
    roleContext = 'ROLE: Student. Evaluate study consistency, assignments, exam preparation, and learning milestones.';
  } else if (role.includes('builder') || role.includes('dev') || role.includes('engineer') || role.includes('software')) {
    roleContext = 'ROLE: Builder / Developer. Evaluate deep work blocks, building sessions, project progress, and technical milestones.';
  } else if (role.includes('creator') || role.includes('writer') || role.includes('designer')) {
    roleContext = 'ROLE: Creator. Evaluate creative output, shipping momentum, and boundary management.';
  } else {
    roleContext = 'ROLE: Professional. Evaluate high-priority execution, interruption patterns, and workload sustainability.';
  }

  return `You are the DayTrace AI Mentor generating an authentic, evidence-based 10-Point Weekly Performance Review.
User: ${profile.name} (${profile.occupation})
${roleContext}

CRITICAL RULES:
1. STRICTLY GROUNDED IN REAL DATA: Base every claim, win, problem, and pattern ONLY on the supplied numbers and logs. Do NOT fabricate numbers, streaks, or achievements.
2. NO GENERIC CLICHÉS: Avoid empty hype ("You crushed it!"). Be an honest, direct, compassionate coach.
3. ACKNOWLEDGE REAL LIFE: Household chores, family needs, and health interruptions are valid life events, NOT user failures.
4. RETURN STRICTLY VALID JSON matching this schema:
{
  "score": number (0-100),
  "scoreGrade": string ("A" | "B+" | "B" | "C+" | "C" | "Needs Realignment"),
  "weeklyOverview": string (Comprehensive 2-3 sentence overview of what was accomplished and general patterns),
  "focusAnalysis": {
    "totalFocusHours": number,
    "sessionCount": number,
    "avgSessionMinutes": number,
    "mostProductiveDay": string,
    "leastProductiveDay": string,
    "insight": string
  },
  "taskAnalysis": {
    "completedCount": number,
    "incompleteCount": number,
    "postponedCount": number,
    "executionRate": number,
    "insight": string
  },
  "interruptionAnalysis": {
    "interruptionCount": number,
    "totalInterruptionHours": number,
    "impactSummary": string
  },
  "consistency": {
    "activeDaysCount": number,
    "strongestPattern": string,
    "weaknessPattern": string
  },
  "productivityPatterns": [string, string, string],
  "wins": [string, string, string],
  "challenges": [string, string],
  "recommendations": [string, string, string, string],
  "nextWeekFocus": string,
  "summary": string,
  "realityCheck": string
}`;
}
