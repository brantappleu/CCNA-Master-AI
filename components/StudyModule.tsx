import React, { useState, useMemo } from 'react';
import { STUDY_TOPICS } from '../constants';
import { generateStudyMaterial } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { BookOpen, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';

const StudyModule: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);

  // Group topics by domain for the sidebar
  const groupedTopics = useMemo(() => {
    const groups: Record<string, typeof STUDY_TOPICS> = {};
    STUDY_TOPICS.forEach(topic => {
      if (!groups[topic.domain]) {
        groups[topic.domain] = [];
      }
      groups[topic.domain].push(topic);
    });
    return groups;
  }, []);

  // Initialize expanded domains
  React.useEffect(() => {
    setExpandedDomains(Object.keys(groupedTopics));
  }, [groupedTopics]);

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleSelectTopic = async (topicId: string, topicTitle: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    setContent("");
    
    const material = await generateStudyMaterial(topicTitle);
    setContent(material);
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar List */}
      <div className="lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Study Roadmap
          </h2>
        </div>
        <div className="p-2">
          {Object.entries(groupedTopics).map(([domain, topics]) => (
            <div key={domain} className="mb-2">
              <button 
                onClick={() => toggleDomain(domain)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
              >
                <span className="font-semibold text-sm text-slate-700">{domain}</span>
                {expandedDomains.includes(domain) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>
              
              {expandedDomains.includes(domain) && (
                <ul className="mt-1 ml-2 space-y-1 border-l-2 border-slate-100 pl-2">
                  {topics.map((topic) => (
                    <li 
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic.id, topic.title)}
                      className={`
                        p-3 cursor-pointer rounded-lg transition-all text-sm flex justify-between items-center group
                        ${selectedTopic === topic.id 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      <span>{topic.title}</span>
                      {selectedTopic === topic.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {!selectedTopic ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
            <BookOpen className="w-16 h-16 mb-4 text-slate-200" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Select a Topic</h3>
            <p className="max-w-md text-slate-500">
              Choose a module from the roadmap on the left. AI will generate a detailed, beginner-friendly study guide for you.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {STUDY_TOPICS.find(t => t.id === selectedTopic)?.domain}
                   </span>
                   <h3 className="font-bold text-lg text-slate-800 leading-tight">
                      {STUDY_TOPICS.find(t => t.id === selectedTopic)?.title}
                   </h3>
                </div>
                <button 
                  onClick={() => handleSelectTopic(selectedTopic, STUDY_TOPICS.find(t => t.id === selectedTopic)?.title || '')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                  title="Regenerate Content"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loading ? (
                <div className="space-y-6 animate-pulse max-w-3xl mx-auto">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-2 pt-4">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                  <div className="h-48 bg-slate-50 rounded-lg border border-slate-100"></div>
                </div>
              ) : (
                <article className="prose prose-slate max-w-none 
                  prose-headings:text-slate-800 prose-headings:font-bold
                  prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-4 prose-p:text-base
                  prose-strong:text-slate-800 prose-strong:font-bold
                  prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-lg prose-pre:shadow-sm
                  prose-li:text-slate-600 prose-li:my-1
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700
                ">
                   <ReactMarkdown>{content}</ReactMarkdown>
                </article>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyModule;