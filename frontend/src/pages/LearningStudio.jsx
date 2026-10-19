import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  HelpCircle,
  FileText,
  Lightbulb,
  ArrowLeft,
  ExternalLink,
  RotateCcw,
  Code2,
  Search,
  BookOpen,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const EXAMPLE_TOPICS = [
  'Python Basics',
  'React Hooks',
  'JavaScript Async & Promises',
  'CSS Grid & Flexbox',
  'Data Structures: Arrays & Trees',
  'SQL Database Queries'
];

const GUIDE_TABS = [
  { id: 'detailed', label: 'Detailed Study Guide', badge: 'In-Depth', icon: BookOpen },
  { id: 'quick', label: 'Quick Reference', badge: 'Revision Cheat Sheet', icon: Zap }
];

const DOWNLOAD_ACTIONS = [
  { type: 'quick', label: 'Quick Reference (PDF)', title: 'Download Quick Reference Cheat Sheet PDF', isPrimary: false },
  { type: 'detailed', label: 'Detailed Study Guide (PDF)', title: 'Download Detailed Study Guide PDF', isPrimary: true }
];

const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80';

const getVideoThumbnail = (video) => {
  if (!video) return null;
  if (video.url) {
    const match = video.url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  return video.thumbnail || null;
};

const LearningStudio = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('detailed');
  const [downloadingGuideType, setDownloadingGuideType] = useState(null);

  // Helper: Decode and download Base64 PDF
  const downloadBase64Pdf = (base64Data, filename = 'codebloom_study_guide.pdf') => {
    if (!base64Data) return false;
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Failed to decode/download PDF:', err);
      return false;
    }
  };

  const handleDownloadPdf = async (type = 'detailed') => {
    const summary = courseData?.summary;
    if (!summary) return;

    const isQuick = type === 'quick';
    const guideText = isQuick
      ? (summary.quickGuide || summary.cheatSheet)
      : (summary.studyGuide || summary.cheatSheet);

    if (!guideText) return;

    setPdfDownloading(true);
    setDownloadingGuideType(type);

    const precompiledPdf = isQuick ? summary.quickGuidePdf : (summary.studyGuidePdf || summary.cheatSheetPdf);
    const defaultFilename = `${(courseData.keyword || 'codebloom').replace(/\s+/g, '_')}_${isQuick ? 'guide' : 'study_guide'}.pdf`;

    // 1. Check if server already returned pre-compiled PDF data
    if (precompiledPdf?.data) {
      const success = downloadBase64Pdf(
        precompiledPdf.data,
        precompiledPdf.filename || defaultFilename
      );
      if (success) {
        setPdfDownloading(false);
        setDownloadingGuideType(null);
        return;
      }
    }

    // 2. Fallback: Request PDF generation from the backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: guideText,
          filename: defaultFilename
        })
      });

      const data = await response.json();
      if (data?.data) {
        downloadBase64Pdf(data.data, data.filename || defaultFilename);
      } else {
        alert('Could not download PDF. Please try again.');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Check backend connection.');
    } finally {
      setPdfDownloading(false);
      setDownloadingGuideType(null);
    }
  };

  const handleGenerateCourse = async (topicToSearch) => {
    const term = (topicToSearch || keyword).trim();
    if (!term) {
      setError('Please enter a topic or select one of the suggested examples.');
      return;
    }

    setLoading(true);
    setError(null);
    setQuizAnswers({});
    setActiveGuideTab('detailed');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: term })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setCourseData(data);
      setKeyword(term);
    } catch (err) {
      console.error('Course generation error:', err);
      setError(err.message || 'Failed to generate course. Please check backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (qIndex, oIndex, question) => {
    if (quizAnswers[qIndex] !== undefined) return; // Prevent changing answer once selected

    const isCorrect = oIndex === question.correctAnswer;
    setQuizAnswers((prev) => ({
      ...prev,
      [qIndex]: {
        selected: oIndex,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    }));
  };

  const resetQuiz = () => {
    setQuizAnswers({});
  };

  // Helper to format plain-text study guide into structured blocks
  const renderStudyGuide = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
      <div className="space-y-4 text-gray-800 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Section Header (ALL CAPS lines)
          if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !/^\d+\./.test(trimmed)) {
            return (
              <h4
                key={idx}
                className="text-lg font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3 pt-3 mt-4 first:mt-0 tracking-wide"
              >
                {trimmed}
              </h4>
            );
          }

          // Code block detection
          if (
            trimmed.startsWith('const ') ||
            trimmed.startsWith('let ') ||
            trimmed.startsWith('function ') ||
            trimmed.startsWith('def ') ||
            trimmed.startsWith('class ') ||
            trimmed.includes('=>') ||
            trimmed.startsWith('import ')
          ) {
            return (
              <pre
                key={idx}
                className="bg-gray-900 text-emerald-400 font-mono text-sm p-3 rounded-lg overflow-x-auto shadow-inner my-2"
              >
                <code>{trimmed}</code>
              </pre>
            );
          }

          // Numbered list item
          if (/^\d+\./.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-semibold text-emerald-600 min-w-[1.5rem]">
                  {trimmed.match(/^\d+\./)[0]}
                </span>
                <p className="text-gray-700 flex-1">{trimmed.replace(/^\d+\.\s*/, '')}</p>
              </div>
            );
          }

          // Bullet list item
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-emerald-500 font-bold leading-relaxed">•</span>
                <p className="text-gray-700 flex-1">{trimmed.replace(/^[-•]\s*/, '')}</p>
              </div>
            );
          }

          // Regular paragraph / bullet
          return (
            <p key={idx} className="text-gray-700">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link & Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </button>

          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                AI Learning Studio
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                CodeBloom Course Generator
              </h1>
              <p className="mt-2 text-emerald-100 text-base sm:text-lg">
                Enter any programming topic or keyword to instantly generate curated video tutorials,
                interactive quizzes, and downloadable study guides.
              </p>
            </div>
            {/* Background flourish */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
              <Code2 className="w-96 h-96" />
            </div>
          </div>
        </div>

        {/* Topic Input Box */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateCourse();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter a topic (e.g. Python, React Hooks, CSS Grid, SQL)..."
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Course
                </>
              )}
            </button>
          </form>

          {/* Example Topic Suggestions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-1">Try asking for:</span>
            {EXAMPLE_TOPICS.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setKeyword(topic);
                  handleGenerateCourse(topic);
                }}
                disabled={loading}
                className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full transition-colors font-medium"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 font-bold ml-2 hover:underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* Loading Spinner View */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center my-8">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Crafting Your Mini-Course...</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
              Curating video lessons, generating customized quiz questions, and compiling your study notes.
            </p>
          </div>
        )}

        {/* Generated Course Results */}
        {!loading && courseData && (
          <div className="space-y-10 animate-fade-in">
            {/* Header / Bonus Tip Callout */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-900">
                  Course Generated for "{courseData.keyword}"
                </h3>
                {courseData.bonusTip && (
                  <p className="text-emerald-800 text-sm mt-1">{courseData.bonusTip}</p>
                )}
              </div>
            </div>

            {/* Section 1: Curated Video Tutorials */}
            {courseData.videos && courseData.videos.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Play className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Curated Video Tutorials</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseData.videos.map((video, idx) => {
                    const thumbUrl = getVideoThumbnail(video);

                    return (
                      <div
                        key={idx}
                        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between bg-white"
                      >
                        <div>
                          <div className="relative aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={video.title}
                                onError={(e) => {
                                  if (e.target.dataset.fallbackTried) {
                                    e.target.style.display = 'none';
                                    return;
                                  }
                                  e.target.dataset.fallbackTried = 'true';
                                  e.target.src = FALLBACK_THUMBNAIL;
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-gray-900 flex items-center justify-center">
                                <Play className="w-10 h-10 text-emerald-400 opacity-80" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
                              {video.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-2 font-medium">{video.channel}</p>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Watch Video
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 2: Interactive AI Quiz */}
            {courseData.quiz?.questions && courseData.quiz.questions.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Interactive Quiz</h2>
                      <p className="text-xs text-gray-500">Test your understanding with instant feedback</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      Answered: {Object.keys(quizAnswers).length} / {courseData.quiz.questions.length}
                    </span>
                    {Object.keys(quizAnswers).length > 0 && (
                      <button
                        onClick={resetQuiz}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {courseData.quiz.questions.map((q, qIdx) => {
                    const answerState = quizAnswers[qIdx];
                    const isAnswered = answerState !== undefined;

                    return (
                      <div
                        key={qIdx}
                        className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900 text-base mb-4 flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {qIdx + 1}
                          </span>
                          <span>{q.question}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((option, oIdx) => {
                            let optionStyles = 'border-gray-200 bg-white hover:border-emerald-400 text-gray-800';

                            if (isAnswered) {
                              if (oIdx === q.correctAnswer) {
                                optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-500';
                              } else if (oIdx === answerState.selected && !answerState.isCorrect) {
                                optionStyles = 'border-red-400 bg-red-50 text-red-900 font-medium ring-1 ring-red-400';
                              } else {
                                optionStyles = 'border-gray-200 bg-white opacity-60 text-gray-500';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => handleQuizSelect(qIdx, oIdx, q)}
                                className={`text-left p-3.5 rounded-lg border text-sm transition-all flex items-center justify-between gap-2 ${optionStyles}`}
                              >
                                <span>{option}</span>
                                {isAnswered && oIdx === q.correctAnswer && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                )}
                                {isAnswered && oIdx === answerState.selected && !answerState.isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {isAnswered && (
                          <div
                            className={`mt-4 p-3.5 rounded-lg text-sm border flex items-start gap-2.5 ${
                              answerState.isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}
                          >
                            {answerState.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold text-xs uppercase tracking-wider mb-0.5">
                                {answerState.isCorrect ? 'Correct!' : 'Incorrect'}
                              </p>
                              <p className="text-xs sm:text-sm leading-relaxed">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 3: Study Notes & Cheat Sheet */}
            {(courseData.summary?.studyGuide || courseData.summary?.cheatSheet || courseData.summary?.quickGuide) && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Study Guides & Reference Notes</h2>
                      <p className="text-xs text-gray-500">In-depth concepts, code examples, syntax, and revision cheat sheets</p>
                    </div>
                  </div>

                  {/* Dual PDF Download Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {DOWNLOAD_ACTIONS.map(({ type, label, title, isPrimary }) => (
                      <button
                        key={type}
                        onClick={() => handleDownloadPdf(type)}
                        disabled={pdfDownloading}
                        title={title}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm text-xs sm:text-sm ${
                          isPrimary
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {downloadingGuideType === type ? (
                          <>
                            <Loader2 className={`w-4 h-4 animate-spin ${isPrimary ? '' : 'text-emerald-600'}`} />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className={`w-4 h-4 ${isPrimary ? '' : 'text-emerald-600'}`} />
                            <span>{label}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessible Guide Selector Tabs */}
                <div
                  role="tablist"
                  aria-label="Study Guide View Selector"
                  className="flex border-b border-gray-200 mb-6 gap-2"
                >
                  {GUIDE_TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        aria-selected={activeGuideTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setActiveGuideTab(tab.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-all -mb-px ${
                          activeGuideTab === tab.id
                            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg font-semibold'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-normal ${
                            activeGuideTab === tab.id
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Guide Panel */}
                <div
                  role="tabpanel"
                  id={activeGuideTab === 'detailed' ? 'panel-detailed' : 'panel-quick'}
                  aria-labelledby={activeGuideTab === 'detailed' ? 'tab-detailed' : 'tab-quick'}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                >
                  {activeGuideTab === 'detailed'
                    ? renderStudyGuide(courseData.summary.studyGuide || courseData.summary.cheatSheet)
                    : renderStudyGuide(courseData.summary.quickGuide || courseData.summary.cheatSheet)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LearningStudio;
