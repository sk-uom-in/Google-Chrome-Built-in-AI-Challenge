// Function to check Translation API availability
async function checkTranslationAPI() {
  try {
    const result = await chrome.i18n.getAcceptLanguages();
    console.log("Available languages:", result);
    return true;
  } catch (error) {
    console.error("API test failed:", error);
    return false;
  }
}

// Helper function to check AI capabilities
async function checkAICapabilities() {
  try {
    const summarizerCapability = await ai.summarizer.capabilities();
    const languageModelCapability = await ai.languageModel.capabilities();
    
    return {
      canSummarize: summarizerCapability.available !== 'no',
      canPrompt: languageModelCapability.available !== 'no'
    };
  } catch (error) {
    console.error('AI Capabilities check failed:', error);
    return { canSummarize: false, canPrompt: false };
  }
}

// Initialize AI services
let summarizer = null;
let languageSession = null;

async function initializeAIServices() {
  const capabilities = await checkAICapabilities();
  
  if (capabilities.canSummarize) {
    summarizer = await ai.summarizer.create();
  }
  
  if (capabilities.canPrompt) {
    languageSession = await ai.languageModel.create({
      systemPrompt: "You are a helpful assistant that answers questions about text content clearly and concisely."
    });
  }
}

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  initializeAIServices();
});

// Message handler for translation requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'translate') {
    const { text, targetLang } = request.data;
    
    // Using Google Translate API
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.append('client', 'gtx');
    url.searchParams.append('sl', 'auto');
    url.searchParams.append('tl', targetLang);
    url.searchParams.append('dt', 't');
    url.searchParams.append('q', text);

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data || !data[0]) {
          throw new Error('Invalid response from translation service');
        }
        // Extract translated text from response
        const translatedText = data[0]
          .map(item => item[0])
          .join('');
        
        console.log('Translation successful:', translatedText);
        sendResponse({ translation: translatedText });
      })
      .catch(error => {
        console.error('Translation error:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // Keep message channel open for async response
  }
  else if (request.type === 'checkCapabilities') {
    checkAICapabilities()
      .then(capabilities => {
        sendResponse(capabilities);
      })
      .catch(error => {
        sendResponse({ canSummarize: false, canPrompt: false });
      });
    return true; // Indicates we will send response asynchronously
  }
  else if (request.type === 'summarize') {
    handleSummarization(request.data.text)
      .then(summary => {
        sendResponse({ summary });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true;
  }
  else if (request.type === 'prompt') {
    handlePrompt(request.data.text, request.data.question)
      .then(answer => {
        sendResponse({ answer });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true;
  }
  return true;
});

// Check API on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  checkTranslationAPI();
}); 