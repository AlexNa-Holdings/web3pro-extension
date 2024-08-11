// content.js
const scriptElement = document.createElement('script');
scriptElement.src = chrome.runtime.getURL('inject.js'); // Points to your inject.js file in the extension's directory
scriptElement.onload = () => scriptElement.remove(); // Remove the script tag after it has been executed
(document.head || document.documentElement).appendChild(scriptElement);
