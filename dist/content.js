function getAllPageText(){const t=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, article, section, div");let e="";return t.forEach((t=>{null!==t.offsetParent&&t.textContent.trim()&&(e+=t.textContent.trim()+"\n")})),e}chrome.runtime.onMessage.addListener(((t,e,n)=>("getPageText"===t.action&&n({text:getAllPageText()}),!0)));