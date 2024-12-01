function getAllPageText() {
    // Get all text elements while excluding script and style tags
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, section, div');
    let text = '';
    
    textElements.forEach(element => {
        // Check if the element is visible and has direct text content
        if (element.offsetParent !== null && element.textContent.trim()) {
            text += element.textContent.trim() + '\n';
        }
    });
    
    return text;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageText') {
        sendResponse({ text: getAllPageText() });
    }
    return true;
}); 