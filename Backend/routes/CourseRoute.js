const express = require('express');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const youtubeKey = process.env.YOUTUBE_API_KEY;

  res.json({
    status: 'OK',
    message: 'CodeBloom Course & AI API running',
    hasGeminiKey: Boolean(geminiKey && geminiKey.trim()),
    hasYouTubeKey: Boolean(youtubeKey && youtubeKey.trim())
  });
});

// Main course generation route
router.post('/generate-course', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  const cleanKeyword = keyword.trim();

  try {
    const [quiz, summary, videos, bonusTip] = await Promise.all([
      generateQuiz(cleanKeyword),
      generateSummary(cleanKeyword),
      fetchYouTubeVideos(cleanKeyword),
      generateBonusTip(cleanKeyword)
    ]);

    res.json({
      keyword: cleanKeyword,
      quiz,
      summary,
      videos,
      bonusTip,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Course generation failed:', err.message);
    res.status(500).json({
      error: 'Failed to generate course',
      details: err.message
    });
  }
});

// Endpoint to generate a PDF from provided text
router.post('/generate-pdf', async (req, res) => {
  try {
    const { text, filename } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const safeFilename = (filename || 'codebloom_study_guide.pdf').replace(/[^a-zA-Z0-9_\-.]/g, '_');
    const pdfBase64 = await createPdfFromText(text, safeFilename);
    return res.json({ filename: safeFilename, data: pdfBase64 });
  } catch (err) {
    console.error('/api/generate-pdf error:', err.message || err);
    return res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
});

// --- Gemini API Helpers ---

async function generateQuiz(keyword) {
  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackQuiz(keyword);
  }

  const prompt = `
You are an expert educator for CodeBloom. Generate exactly 5 quiz questions about "${keyword}".
Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const { data } = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.7
        }
      },
      { timeout: 30000 }
    );

    const raw = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    const parsed = safeParseJSON(raw);
    if (parsed?.questions && Array.isArray(parsed.questions)) {
      return { questions: parsed.questions.slice(0, 5) };
    }

    return buildFallbackQuiz(keyword);
  } catch (err) {
    console.error('Gemini quiz error:', err.message);
    return buildFallbackQuiz(keyword);
  }
}

async function generateSummary(keyword) {
  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackSummary(keyword);
  }

  const prompt = `
You are an expert computer science educator for CodeBloom. Generate two distinct, structured learning documents for the topic "${keyword}".

1. DETAILED STUDY GUIDE:
A comprehensive, in-depth study guide providing thorough conceptual and practical understanding.
Include the following sections with ALL CAPS headings:
- OVERVIEW AND CORE CONCEPTS
- IN-DEPTH DEFINITIONS AND ARCHITECTURE
- ESSENTIAL SYNTAX AND PRACTICAL CODE EXAMPLES (include realistic code snippets)
- COMMON PITFALLS AND MISTAKES TO AVOID
- BEST PRACTICES AND HANDS-ON APPLICATION

2. QUICK REFERENCE GUIDE:
A concise, high-yield quick revision cheat sheet for "${keyword}".
Must be topic-specific and actionable (NOT generic filler).
Include the following sections with ALL CAPS headings:
- CORE DEFINITION & KEYWORDS
- SYNTAX CHEAT SHEET (concise command/method signatures and a compact code snippet)
- ESSENTIAL RULES & CONVENTIONS
- QUICK REVISION CHECKLIST

Rules:
- Do not use markdown asterisks (*, **) or hash symbols (#).
- Use clear ALL CAPS section headers and numbered points for lists.
- Provide genuine technical content specific to "${keyword}".

Return ONLY a valid JSON object matching this schema:
{
  "studyGuide": "text of the detailed study guide",
  "quickGuide": "text of the quick reference guide"
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const { data } = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 4096
        }
      },
      { timeout: 35000 }
    );

    const raw = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    const parsed = safeParseJSON(raw);

    const cleanBase = keyword.replace(/\s+/g, '_');
    const studyFilename = `${cleanBase}_study_guide.pdf`;
    const quickFilename = `${cleanBase}_guide.pdf`;

    if (parsed?.studyGuide && parsed?.quickGuide) {
      const studyGuideText = parsed.studyGuide.trim();
      const quickGuideText = parsed.quickGuide.trim();

      return {
        studyGuide: studyGuideText,
        quickGuide: quickGuideText,
        studyGuidePdf: { filename: studyFilename },
        quickGuidePdf: { filename: quickFilename },
        // Backwards compatibility for existing consumers
        cheatSheet: studyGuideText,
        cheatSheetPdf: { filename: studyFilename }
      };
    }

    // If Gemini returned a single text block rather than parsed JSON
    if (raw && !parsed) {
      const quickText = extractQuickGuideFromText(raw, keyword);

      return {
        studyGuide: raw,
        quickGuide: quickText,
        studyGuidePdf: { filename: studyFilename },
        quickGuidePdf: { filename: quickFilename },
        cheatSheet: raw,
        cheatSheetPdf: { filename: studyFilename }
      };
    }

    return buildFallbackSummary(keyword);
  } catch (err) {
    console.error('Gemini summary error:', err.message);
    return buildFallbackSummary(keyword);
  }
}

async function generateBonusTip(keyword) {
  if (!process.env.GEMINI_API_KEY) {
    return `💡 Tip: Practice ${keyword} concepts by building small projects and writing tests.`;
  }

  const prompt = `Give a short, actionable bonus learning tip for mastering "${keyword}". Format: one clear sentence.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const { data } = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'text/plain',
          temperature: 0.7
        }
      },
      { timeout: 15000 }
    );

    const tip = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    return tip || `💡 Tip: Practice ${keyword} concepts by building small projects and writing tests.`;
  } catch {
    return `💡 Tip: Practice ${keyword} concepts by building small projects and writing tests.`;
  }
}

async function fetchYouTubeVideos(keyword) {
  if (!process.env.YOUTUBE_API_KEY) {
    return buildFallbackVideos(keyword);
  }

  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${keyword} tutorial programming`,
        type: 'video',
        maxResults: 5,
        key: process.env.YOUTUBE_API_KEY
      },
      timeout: 10000
    });

    return (res.data.items || []).map((item) => {
      const videoId = item.id?.videoId;
      const thumbnail = videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : (item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url);
      return {
        title: item.snippet.title,
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' tutorial')}`,
        thumbnail,
        channel: item.snippet.channelTitle
      };
    });
  } catch (err) {
    console.error('YouTube search error:', err.message);
    return buildFallbackVideos(keyword);
  }
}

// --- Fallback Generators ---

function buildFallbackVideos(keyword) {
  return [
    {
      title: `${keyword} Full Beginner Tutorial & Fundamentals`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' tutorial')}`,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80',
      channel: 'CodeBloom Academy'
    },
    {
      title: `${keyword} Crash Course for Developers`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' crash course')}`,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      channel: 'Developer Foundations'
    }
  ];
}

function buildFallbackQuiz(keyword) {
  return {
    questions: [
      {
        question: `What is the primary role of ${keyword} in modern software development?`,
        options: [
          `Building robust, scalable solutions using ${keyword}`,
          'Replacing database storage completely',
          'Formatting hardware memory manually',
          'Executing machine language instructions directly'
        ],
        correctAnswer: 0,
        explanation: `${keyword} provides structured programming capabilities and libraries for building modern applications.`
      },
      {
        question: `Which of the following is considered a best practice when working with ${keyword}?`,
        options: [
          'Writing modular, readable code with proper error handling',
          'Avoiding comments and documentation',
          'Hardcoding configuration credentials into source code',
          'Disabling all testing and type checking'
        ],
        correctAnswer: 0,
        explanation: 'Modular design, readability, and error handling are universally recognized best practices.'
      },
      {
        question: `How should dependencies and libraries in ${keyword} projects typically be managed?`,
        options: [
          'Using a package manager and manifest file (e.g. package.json, requirements.txt)',
          'Copy-pasting binary files manually into system root',
          'Emailing scripts across team members',
          'Compiling the operating system kernel on every run'
        ],
        correctAnswer: 0,
        explanation: 'Package managers ensure consistent, reproducible dependencies across environments.'
      },
      {
        question: `What is a recommended first step when debugging an issue in ${keyword}?`,
        options: [
          'Reading error logs, stack traces, and testing isolated inputs',
          'Restarting the computer without checking error output',
          'Deleting the codebase and starting from scratch',
          'Ignoring the stack trace'
        ],
        correctAnswer: 0,
        explanation: 'Stack traces and logs point directly to the line and reason for failure.'
      },
      {
        question: `What is the best way to gain mastery of ${keyword}?`,
        options: [
          'Hands-on practice by building real-world projects and solving challenges',
          'Only reading documentation without writing any code',
          'Memorizing entire source libraries by rote',
          'Skipping foundational concepts'
        ],
        correctAnswer: 0,
        explanation: 'Active coding and project building reinforce mental models and problem-solving skills.'
      }
    ]
  };
}

// --- Topic Knowledge Catalog for Fallback Generation ---

const TOPIC_CATALOG = [
  {
    name: 'Python Basics',
    title: 'PYTHON PROGRAMMING',
    matches: (norm) => norm.includes('python'),
    overview: [
      'Python is an interpreted, high-level, dynamically-typed programming language emphasizing code readability and simplicity.',
      'Code blocks are defined exclusively through consistent whitespace indentation rather than curly braces or keywords.',
      'Everything in Python is an object, including functions, modules, classes, and primitive values.'
    ],
    concepts: [
      'Lists: Mutable, ordered sequences of elements supporting append, pop, and slicing.',
      'Tuples: Immutable, ordered sequences ideal for fixed collections and dictionary keys.',
      'Dictionaries: Key-value hash maps with O(1) average lookup time. Keys must be immutable and hashable.',
      'Sets: Unordered collections of unique elements providing fast membership testing.'
    ],
    codeSnippet: `def calculate_metrics(values, threshold=10):
    filtered = [v for v in values if v >= threshold]
    return {"count": len(filtered), "total": sum(filtered)}`,
    pitfalls: [
      'Mutable Default Arguments: Defining def append_item(x, lst=[]) shares the same list across all calls; always use lst=None.',
      'Modifying Collections During Iteration: Modifying a list while iterating over it causes skipped elements; iterate over list.copy().',
      'Equality vs Identity: Use == for value comparison; use is for object identity comparison (e.g. x is None).'
    ],
    bestPractices: [
      'Indentation: Strictly follow PEP 8 with 4 spaces per indentation level.',
      'Type Annotations: Use type annotations (def fetch(user_id: int) -> dict:) for static type checking with mypy.',
      'Context Managers: Always use with open(...) as f: to guarantee file descriptor cleanup.'
    ],
    quickSyntax: [
      'Function: def fn_name(param1, default_val=10): return param1 * default_val',
      'Slicing: sequence[start:stop:step] (e.g., nums[1:5:2], nums[::-1] reverses)',
      'List Comprehension: [x**2 for x in items if x > 0]',
      'Dict Lookup: val = data.get("key", default_value)',
      'Formatted String: f"User: {name}, Score: {score}"'
    ]
  },
  {
    name: 'React Hooks',
    title: 'REACT & REACT HOOKS',
    matches: (norm) => norm.includes('react') || norm.includes('hook'),
    overview: [
      'React is a declarative, component-based library for building user interfaces with unidirectional data flow.',
      'The Virtual DOM minimizes direct browser DOM manipulation through batched reconciliation.',
      'Hooks allow functional components to use state, effects, and lifecycle features without writing classes.'
    ],
    concepts: [
      'useState: Manages local component state; returns the current state and an updater function.',
      'useEffect: Manages side effects (fetching data, subscriptions, manual DOM mutations); supports cleanup return.',
      'useRef: Returns a mutable ref object whose .current property persists across renders without triggering a re-render.',
      'useMemo & useCallback: Cache expensive computed calculations and memoize function instances across renders.'
    ],
    codeSnippet: `function Counter({ step = 1 }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        document.title = \`Count: \${count}\`;
    }, [count]);
    return <button onClick={() => setCount(prev => prev + step)}>Increment</button>;
}`,
    pitfalls: [
      'Breaking Rules of Hooks: Never call hooks inside loops, conditional statements, or nested functions.',
      'Stale Closures & Missing Dependencies: Omitting reactive state/props from useEffect dependencies causes stale captured values.',
      'Infinite Re-renders: Calling setState unconditionally inside the component render body triggers an infinite loop.',
      'Direct State Mutation: Modifying state objects or arrays in-place (items.push) fails to trigger reconciliation; always copy state.'
    ],
    bestPractices: [
      'Functional Updates: Use setState(prev => prev + 1) when the new state depends on the previous state.',
      'Custom Hooks: Extract reusable component logic and effects into custom use* hooks.',
      'Keep Components Pure: Render logic must be free of side effects; isolate mutations inside event handlers or effects.'
    ],
    quickSyntax: [
      'State: const [state, setState] = useState(initialValue);',
      'Effects: useEffect(() => { /* mount & update */ return () => /* cleanup */; }, [dependencies]);',
      'Ref: const domRef = useRef(initialValue); // Persists without re-render',
      'Memoized Value: const memoized = useMemo(() => compute(a, b), [a, b]);',
      'Callback Ref: const handler = useCallback(() => doWork(id), [id]);'
    ]
  },
  {
    name: 'JavaScript Async & Promises',
    title: 'JAVASCRIPT ASYNC & PROMISES',
    matches: (norm) => norm.includes('javascript') || norm.includes('promise') || norm.includes('async'),
    overview: [
      'JavaScript executes on a single-threaded runtime utilizing an event loop for non-blocking asynchronous operations.',
      'Microtasks (Promises, queueMicrotask) execute immediately after the current call stack clears, before macrotasks.'
    ],
    concepts: [
      'Call Stack: Synchronous execution stack; functions pushed when called and popped when returned.',
      'Promises: Objects representing eventual completion or failure of an asynchronous operation (Pending, Fulfilled, Rejected).',
      'async/await: Syntactic sugar over Promises providing clean synchronous-looking asynchronous code flow.',
      'Concurrency: Promise.all runs promises concurrently and rejects if any fail; Promise.allSettled waits for all to settle.'
    ],
    codeSnippet: `async function fetchUserData(userId) {
    try {
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return await res.json();
    } catch (err) {
        console.error('Fetch failed:', err.message);
        throw err;
    }
}`,
    pitfalls: [
      'Missing await: Assigning an async call without await sets variables to an unresolved Promise object.',
      'Array.prototype.forEach: forEach does not await async callbacks; use for...of or Promise.all(items.map(...)).',
      'Unhandled Rejections: Promises without catch handlers cause unhandled rejection warnings and silent failures.'
    ],
    bestPractices: [
      'Async Return Value: Remember async functions always return a Promise, even when returning a primitive value.',
      'Parallelization: Avoid serial await calls when tasks are independent; execute them concurrently with Promise.all.'
    ],
    quickSyntax: [
      'Async Function: async function fetchData(url) { const res = await fetch(url); return res.json(); }',
      'Promise: const p = new Promise((resolve, reject) => { resolve(data); });',
      'Parallel: const [a, b] = await Promise.all([taskA(), taskB()]);',
      'Error Handling: try { await action(); } catch (err) { console.error(err); }'
    ]
  },
  {
    name: 'CSS Grid & Flexbox',
    title: 'CSS FLEXBOX & GRID',
    matches: (norm) => norm.includes('css') || norm.includes('flexbox') || norm.includes('grid'),
    overview: [
      'Modern CSS layout engine replacing legacy float and table layouts with dedicated 1D and 2D formatting contexts.',
      'Flexbox manages one-dimensional flow (row or column); CSS Grid manages two-dimensional row and column grids.'
    ],
    concepts: [
      'Box Sizing: Always use box-sizing: border-box so padding and borders are included in total dimensions.',
      'Flex Container: display: flex; justifies items along the main axis and aligns them along the cross axis.',
      'Flex Items: flex-grow, flex-shrink, flex-basis control item flexibility and sizing.',
      'CSS Grid: grid-template-columns and grid-template-rows define 2D track structures with repeat() and minmax().'
    ],
    codeSnippet: `.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    align-items: start;
}`,
    pitfalls: [
      'Flex min-width auto: Flex children default to min-width: auto; set min-width: 0 to allow text truncation and prevent container blowout.',
      'Margin Collapse: Vertical margins collapse in normal flow, but margins do not collapse between flex or grid items.'
    ],
    bestPractices: [
      'Use Flexbox for component-level UI rows/bars; use Grid for major page-level multi-column layouts.',
      'Use gap instead of individual item margins for clean, uniform spacing.'
    ],
    quickSyntax: [
      'Reset: * { box-sizing: border-box; margin: 0; padding: 0; }',
      'Flex: display: flex; justify-content: center; align-items: center; gap: 1rem;',
      'Grid: display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;'
    ]
  },
  {
    name: 'SQL & Database Queries',
    title: 'SQL QUERIES & DATABASE DESIGN',
    matches: (norm) => norm.includes('sql') || norm.includes('database'),
    overview: [
      'Structured Query Language (SQL) is the standard declarative language for relational database management systems.',
      'Queries declare what data to retrieve rather than specifying the algorithmic execution steps.'
    ],
    concepts: [
      'Execution Order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
      'Joins: INNER JOIN returns matched rows; LEFT JOIN returns all left rows plus matching right rows.',
      'Aggregations: COUNT, SUM, AVG aggregate rows; HAVING filters results after GROUP BY.',
      'Indexes: B-Tree indexes provide logarithmic search for WHERE and JOIN conditions at the cost of write overhead.'
    ],
    codeSnippet: `SELECT u.name, COUNT(o.id) AS total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_orders DESC
LIMIT 10;`,
    pitfalls: [
      'SQL Injection: Never concatenate raw user input into SQL queries; always use parameterized queries.',
      'NULL Comparisons: WHERE col = NULL evaluates to UNKNOWN/false; always use IS NULL or IS NOT NULL.',
      'Unbounded UPDATE/DELETE: Forgetting a WHERE clause updates or deletes every row in the entire table.'
    ],
    bestPractices: [
      'ACID Transactions: Wrap multi-table modifications inside transactions (BEGIN ... COMMIT/ROLLBACK).',
      'Normalization: Organize relational schemas in 3NF to eliminate update, insertion, and deletion anomalies.'
    ],
    quickSyntax: [
      'Select & Filter: SELECT col1, col2 FROM table WHERE condition;',
      'Inner Join: SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.t1_id;',
      'Left Join: SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.t1_id;',
      'Grouping: SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING COUNT(*) > 5;'
    ]
  },
  {
    name: 'Data Structures & Algorithms',
    title: 'DATA STRUCTURES & ALGORITHMS',
    matches: (norm) =>
      norm.includes('data structure') ||
      norm.includes('algorithm') ||
      norm.includes('tree') ||
      norm.includes('array'),
    overview: [
      'Data structures organize memory; algorithms specify step-by-step procedures to solve computational problems.',
      'Asymptotic analysis (Big-O) measures computational time and space complexity growth as input size n scales.'
    ],
    concepts: [
      'Arrays & Hash Tables: Arrays offer O(1) index access; Hash tables offer O(1) average lookup and insertion.',
      'Trees & BSTs: Binary Search Trees maintain the invariant that left subtree < node < right subtree.',
      'Stacks & Queues: Stacks follow LIFO (call stack, undo); Queues follow FIFO (task queues, BFS).'
    ],
    codeSnippet: `function binarySearch(sortedArr, target) {
    let left = 0, right = sortedArr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedArr[mid] === target) return mid;
        if (sortedArr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    pitfalls: [
      'Unbalanced BST Degradation: Inserting sorted data into a standard BST degrades search complexity to O(n) linked-list time.',
      'Missing Recursion Base Case: Omitting or incorrectly defining the termination condition triggers stack overflow.',
      'Linear Shift Cost: Array unshift() and splice() operations shift elements in memory, costing O(n) time.'
    ],
    bestPractices: [
      'Choose Structure by Access Pattern: Use Hash Maps for key lookup, Queues for BFS, Stacks for DFS.',
      'Space-Time Trade-offs: Evaluate whether extra memory (memoization table, hash set) can reduce asymptotic runtime.'
    ],
    quickSyntax: [
      'Array Index: O(1) | Search: O(n) | Insert/Delete: O(n)',
      'Hash Table (Avg): Search: O(1) | Insert: O(1) | Delete: O(1)',
      'Balanced BST: Search: O(log n) | Insert: O(log n) | Delete: O(log n)',
      'Stack / Queue: Push/Pop/Enqueue/Dequeue: O(1)'
    ]
  }
];

function findTopic(keyword) {
  const norm = (keyword || '').toLowerCase();
  return TOPIC_CATALOG.find((t) => t.matches(norm)) || null;
}

function formatStudyGuide(topic, keyword) {
  if (!topic) {
    return `${keyword.toUpperCase()} TECHNICAL STUDY GUIDE

1. DOMAIN OVERVIEW AND ARCHITECTURAL PURPOSE
- ${keyword} provides essential capabilities and patterns within software engineering.
- Understanding core building blocks and conventions is critical to building reliable, scalable systems.

2. CORE CONCEPTS AND SYSTEM COMPONENTS
- Key paradigms, execution lifecycles, and underlying data flow models.
- Modular component organization and separation of concerns across application layers.

3. IMPLEMENTATION PATTERNS AND CODE CONVENTIONS
- Establishing clean, maintainable project structure and consistent naming conventions.
- Managing dependencies, environment configurations, and external integrations safely.

4. COMMON TECHNICAL PITFALLS AND OPERATIONAL MISTAKES
- Insufficient error handling and failure to validate boundary conditions.
- Mismanaging state, memory lifecycles, or asynchronous concurrency.
- Inadequate testing of failure paths and edge-case inputs.

5. PRODUCTION BEST PRACTICES AND VERIFICATION
- Implement comprehensive automated testing (unit, integration, regression).
- Enforce secure credential management and keep dependencies updated.`;
  }

  return `${topic.title} COMPREHENSIVE STUDY GUIDE

OVERVIEW AND CORE CONCEPTS
${topic.overview.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

CORE PRINCIPLES & ARCHITECTURE
${topic.concepts.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

ESSENTIAL SYNTAX AND PRACTICAL EXAMPLES
${topic.codeSnippet}

COMMON PITFALLS AND ANTI-PATTERNS
${topic.pitfalls.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

BEST PRACTICES AND VERIFICATION
${topic.bestPractices.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}`;
}

function formatQuickGuide(topic, keyword) {
  if (!topic) {
    return `${keyword.toUpperCase()} QUICK REFERENCE CHEAT SHEET

1. CORE DEFINITION & PURPOSE
- ${keyword} is an essential programming and technical domain.
- Primary focus: Modular, structured architecture and reliable execution.

2. ESSENTIAL CONVENTIONS
- Maintain consistent naming conventions and modular component boundaries.
- Keep configurations separate from core application logic.
- Implement explicit validation at system input boundaries.

3. QUICK REVISION CHECKLIST
- Understand fundamental execution flow and lifecycle stages.
- Validate inputs and handle error scenarios gracefully.
- Write isolated unit tests for critical business logic paths.`;
  }

  return `${topic.title} QUICK REFERENCE CHEAT SHEET

1. CORE DEFINITIONS & KEYWORDS
${topic.overview.map((item) => `- ${item}`).join('\n')}

2. SYNTAX CHEAT SHEET
${topic.quickSyntax.map((item) => `- ${item}`).join('\n')}

3. ESSENTIAL CONVENTIONS & RULES
${topic.bestPractices.map((item) => `- ${item}`).join('\n')}

4. QUICK GOTCHAS
${topic.pitfalls.map((item) => `- ${item}`).join('\n')}`;
}

function buildFallbackSummary(keyword) {
  const cleanBase = (keyword || 'codebloom').replace(/\s+/g, '_');
  const topic = findTopic(keyword);
  const studyGuideText = formatStudyGuide(topic, keyword);
  const quickGuideText = formatQuickGuide(topic, keyword);

  return {
    studyGuide: studyGuideText,
    quickGuide: quickGuideText,
    studyGuidePdf: { filename: `${cleanBase}_study_guide.pdf` },
    quickGuidePdf: { filename: `${cleanBase}_guide.pdf` },
    cheatSheet: studyGuideText,
    cheatSheetPdf: { filename: `${cleanBase}_study_guide.pdf` }
  };
}

function extractQuickGuideFromText(text, keyword) {
  const topic = findTopic(keyword);
  if (!text) return formatQuickGuide(topic, keyword);
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const importantLines = lines.filter((l) =>
    /^[A-Z\s]{4,}$/.test(l.trim()) ||
    /^\d+\./.test(l.trim()) ||
    /^(const|let|var|function|def|class|import)\b|=>/.test(l.trim())
  );

  if (importantLines.length >= 6) {
    return `${keyword.toUpperCase()} QUICK REFERENCE GUIDE\n\n` + importantLines.slice(0, 20).join('\n');
  }

  return formatQuickGuide(topic, keyword);
}

// PDF generator using PDFKit
async function createPdfFromText(text, filename = 'codebloom_guide.pdf') {
  return new Promise((resolve, reject) => {
    try {
      const isStudyGuide = filename.includes('study_guide');
      const doc = new PDFDocument({
        autoFirstPage: true,
        margin: 50,
        info: {
          Title: `CodeBloom - ${filename}`,
          Author: 'CodeBloom AI Learning Studio'
        }
      });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).fillColor('#059669').text('CodeBloom AI Learning Studio', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#6b7280').text(
        isStudyGuide ? 'Comprehensive Study Guide & In-Depth Concept Review' : 'Quick Reference Guide & Syntax Cheat Sheet',
        { align: 'center' }
      );
      doc.moveDown(1.5);

      // Body text
      doc.fontSize(11).fillColor('#1f2937').text(text, {
        align: 'left',
        lineGap: 4
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// Safe JSON parser utility
function safeParseJSON(text) {
  if (!text) return null;
  try {
    let cleaned = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

module.exports = router;
