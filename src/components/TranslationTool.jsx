import React, { useState } from 'react';

const TranslationTool = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="translation-tool">
      {/* Top Controls */}
      <div className="controls">
        <button 
          onClick={getSelectedText}
          className="button primary"
        >
          Get Selected Text
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
        </div>
      )}
    </div>
  );
};

export default TranslationTool; 