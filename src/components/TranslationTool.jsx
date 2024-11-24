import React, { useState } from 'react';

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
  
  

  return (
    <div className="translation-tool">
    
        {/* Theme Toggle Button */}
        <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      {/* Top Controls */}
      <div className="controls">
        <button 
          onClick={getSelectedText}
          className="button primary"
        >
          <SelectIcon /> Get Selected Text
        </button>
        <select 
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="language-select"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Input Area */}
      <div className="input-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter or paste text to translate..."
          className="text-input"
          rows={4}
        />
      </div>

      {/* Translate Button */}
      <button 
        onClick={handleTranslate}
        disabled={isLoading || !inputText.trim()}
        className="button translate-button"
      >
        {isLoading ? 'Translating...' : 'Translate'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Output Area */}
      {translatedText && (
        <div className="output-area">
          <h3>Translation:</h3>
          <div className="translated-text">
            {translatedText}
          </div>
          <button 
                onClick={() => {
                    console.log('Copy button clicked');
                    copyToClipboard(translatedText);
                }}
                className="button copy-button"
                >
                <CopyIcon /> Copy
        </button>

        </div>
      )}
    </div>
  );
};

export default TranslationTool; 