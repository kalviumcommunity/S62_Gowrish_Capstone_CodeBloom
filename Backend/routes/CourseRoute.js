const express = require('express');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CodeBloom Course & AI API running',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasYouTubeKey: Boolean(process.env.YOUTUBE_API_KEY)
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
    return await buildFallbackSummary(keyword);
  }

  const prompt = `
Create a comprehensive plain text study guide for "${keyword}".
Include:
1. Overview and core concepts
2. Key syntax, patterns, and principles
3. Common pitfalls to avoid
4. Practical hands-on recommendations

Do not use markdown formatting, asterisks, or hash symbols. Use clear section headings in ALL CAPS and numbered points for lists.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const { data } = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'text/plain',
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2048
        }
      },
      { timeout: 30000 }
    );

    const raw = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    if (raw) {
      try {
        const filename = `${keyword.replace(/\s+/g, '_')}_study_guide.pdf`;
        const pdfBase64 = await createPdfFromText(raw, filename);
        return {
          cheatSheet: raw,
          cheatSheetPdf: { filename, data: pdfBase64 }
        };
      } catch {
        return { cheatSheet: raw };
      }
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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

    return (res.data.items || []).map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channel: item.snippet.channelTitle
    }));
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
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc13c72620a?w=400&auto=format&fit=crop&q=80',
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

async function buildFallbackSummary(keyword) {
  const cheatSheet = formatSummary(keyword);
  try {
    const filename = `${keyword.replace(/\s+/g, '_')}_guide.pdf`;
    const pdfBase64 = await createPdfFromText(cheatSheet, filename);
    return { cheatSheet, cheatSheetPdf: { filename, data: pdfBase64 } };
  } catch {
    return { cheatSheet };
  }
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

function formatSummary(keyword) {
  return `${keyword.toUpperCase()} QUICK REFERENCE GUIDE

OVERVIEW AND CORE CONCEPTS
1. ${keyword} is a foundational programming topic essential for building reliable software.
2. Understanding fundamental syntax, data flow, and control structures is key to mastering this domain.

BEST PRACTICES
1. Write clean, descriptive variable and function names.
2. Maintain modular code structure and separate concerns cleanly.
3. Handle edge cases and unexpected inputs gracefully.

NEXT STEPS AND APPLICATION
1. Build small, iterative practice projects to solidify your understanding.
2. Review community resources, documentation, and write unit tests.`;
}

// PDF generator using PDFKit
async function createPdfFromText(text, filename = 'codebloom_guide.pdf') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        autoFirstPage: true,
        margin: 50,
        info: {
          Title: `CodeBloom Study Guide - ${filename}`,
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
      doc.fontSize(10).fillColor('#6b7280').text('Personalized Study Guide & Reference Notes', { align: 'center' });
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
