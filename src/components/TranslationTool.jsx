import React, { useState, useEffect } from 'react';

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const SelectIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 8h10M7 12h10M7 16h10"/>
  </svg>
);

const TranslationTool = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pageText, setPageText] = useState('');
  const [summary, setSummary] = useState('');
  const [summarizer, setSummarizer] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const languages = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi'
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'translate',
        data: {
          text: inputText,
          targetLang: targetLanguage
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setTranslatedText(response.translation);
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedText = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString(),
      });
      if (result) {
        setInputText(result);
      }
    } catch (error) {
      setError('Failed to get selected text: ' + error.message);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Copy failed:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      setError('Failed to copy text: ' + error.message);
    }
  };

  const DarkModeIcon = ({ isDarkMode }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
    >
      {isDarkMode ? (
        <path d="M12 1v2M12 21v2M4.222 4.222l1.415 1.415M18.364 18.364l1.415 1.415M1 12h2M21 12h2M4.222 19.778l1.415-1.415M18.364 5.636l1.415-1.415M12 5a7 7 0 017 7 7 7 0 01-7 7 7 7 0 010-14z" />
      ) : (
        <path d="M17.293 17.293A8 8 0 016.707 6.707 8.004 8.004 0 0012 20a8.004 8.004 0 005.293-2.707z" />
      )}
    </svg>
  );

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  const ThemeToggleButton = ({ isDarkMode, toggleTheme }) => (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDarkMode ? 'Dark' : 'Light'} mode`}
    >
      {isDarkMode ? 'Light' : 'Dark'}
    </button>
  );
  
  const getPageText = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, section, div');
          return Array.from(textElements)
            .filter(el => el.offsetParent !== null && el.textContent.trim())
            .map(el => el.textContent.trim())
            .join('\n');
        },
      });
      setPageText(result);
      return result;
    } catch (error) {
      setError('Failed to get page text: ' + error.message);
    }
  };

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const text = await getSelectedText();
      if (!text.trim()) {
        throw new Error('No content selected to summarize');
      }

      const response = await chrome.runtime.sendMessage({
        type: 'summarize',
        data: { text }
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setSummary(response.summary);
      setInputText(response.summary); // Set summary as input for translation
    } catch (error) {
      setError('Summarization failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'prompt',
        data: { 
          text: inputText,
          question: question.trim()
        }
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setAnswer(response.answer);
    } catch (error) {
      setError('Failed to get answer: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize summarizer with correct type
  useEffect(() => {
    const initSummarizer = async () => {
      try {
        console.log('Initializing summarizer...');
        const canSummarize = await ai.summarizer.capabilities();
        
        if (canSummarize && canSummarize.available !== 'no') {
          const newSummarizer = await ai.summarizer.create({
            type: 'key-points',        // Valid enum value: 'key-points'
            format: 'markdown',
            length: 'medium',          // Use medium length
            maxWords: 200,             // Max words
            minWords: 150              // Min words
          });
          setSummarizer(newSummarizer);
          setIsInitialized(true);
          console.log('Summarizer initialized successfully');
        } else {
          throw new Error('Summarizer not available');
        }
      } catch (error) {
        console.error('Summarizer initialization error:', error);
        setError('Failed to initialize summarizer: ' + error.message);
        setIsInitialized(false);
      }
    };

    initSummarizer();

    return () => {
      if (summarizer) {
        summarizer.destroy();
      }
    };
  }, []);

  const handleGetAndSummarizeText = async () => {
    if (!isInitialized || !summarizer) {
      setError('Please wait for summarizer to initialize...');
      return;
    }

    setIsSummarizing(true);
    setError(null);
    
    try {
      const [tab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      });

      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // First, get element counts
      const debugResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            pCount: document.getElementsByTagName('p').length,
            h1Count: document.getElementsByTagName('h1').length,
            h2Count: document.getElementsByTagName('h2').length,
            articleCount: document.getElementsByTagName('article').length
          };
        }
      });

      console.log('Element counts:', debugResults[0].result);

      // Then, get the actual text
      const textResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Get all paragraphs
          const paragraphs = Array.from(document.getElementsByTagName('p'));
          let text = '';

          // Extract text from paragraphs
          paragraphs.forEach(p => {
            const content = p.textContent.trim();
            if (content) {
              text += content + '\n\n';
            }
          });

          // If no paragraph text, try getting text from articles
          if (!text.trim()) {
            const articles = Array.from(document.getElementsByTagName('article'));
            articles.forEach(article => {
              const content = article.textContent.trim();
              if (content) {
                text += content + '\n\n';
              }
            });
          }

          // If still no text, try getting from divs with substantial content
          if (!text.trim()) {
            const divs = Array.from(document.getElementsByTagName('div'));
            divs.forEach(div => {
              const content = div.textContent.trim();
              if (content && content.length > 100) { // Only get divs with substantial content
                text += content + '\n\n';
              }
            });
          }

          return text.trim();
        }
      });

      console.log('Text extraction result length:', textResults[0].result?.length);

      if (!textResults[0].result) {
        throw new Error(`No text content found. Elements found: ${JSON.stringify(debugResults[0].result)}`);
      }

      const pageContent = textResults[0].result;

      // Log a preview of the content
      console.log('Content preview:', pageContent.substring(0, 200));

      // Proceed with summarization
      console.log('Starting summarization...');
      const summaryResult = await summarizer.summarize(pageContent);
      console.log('Summary created:', summaryResult);
      setSummary(summaryResult);
      
      // Automatically set the summary as input text
      setInputText(summaryResult);

    } catch (error) {
      console.error('Full error details:', error);
      setError('Failed to get and summarize text: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSummarizing(false);
    }
  };

  // Function to format any markdown text (for both summary and translation)
  const formatMarkdownText = (text) => {
    if (!text) return null;

    // Split text into lines and process each
    const lines = text.split('\n').filter(line => line.trim());
    let currentList = [];
    const elements = [];

    lines.forEach((line, index) => {
      const cleanLine = line.replace(/\*\*/g, '').trim(); // Remove ** markers

      // Check if it's a list item
      if (cleanLine.startsWith('*')) {
        currentList.push(cleanLine.substring(1).trim());
      } else {
        // If we have a list waiting to be rendered
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="formatted-list">
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }

        // Regular paragraph
        if (cleanLine) {
          elements.push(
            <p key={`p-${index}`} className="formatted-paragraph">
              {cleanLine}
            </p>
          );
        }
      }
    });

    // Add any remaining list items
    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" className="formatted-list">
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="translation-tool">
      <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <button 
        onClick={handleGetAndSummarizeText}
        className="button primary get-text-btn"
        disabled={isSummarizing || !isInitialized}
      >
        {!isInitialized ? 'Initializing...' : 
         isSummarizing ? 'Summarizing...' : 
         'Get & Summarize Page Text'}
      </button>

      {/* Summary Section */}
      {summary && (
        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-content">
            {formatMarkdownText(summary)}
          </div>
        </div>
      )}

      {/* Translation Controls - Updated Layout */}
      {summary && (
        <div className="translation-row" style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <select 
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="language-select"
            style={{ flex: '1' }}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="button translate-button"
            style={{ whiteSpace: 'nowrap' }}
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Translation Output */}
      {translatedText && (
        <div className="output-area">
          <h3>Translation:</h3>
          <div className="formatted-content">
            {formatMarkdownText(translatedText)}
          </div>
          <button 
            onClick={() => copyToClipboard(translatedText)}
            className="button copy-button"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default TranslationTool; 