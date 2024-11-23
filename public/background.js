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
  return true; // Add this line to handle all message types
});

// Check API on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  checkTranslationAPI();
}); 