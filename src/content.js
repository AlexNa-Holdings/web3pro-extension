// relay messages from the extension to the page and vice versa
chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  console.log("content: payload", payload);

  window.postMessage(
    { type: "eth:payload", payload: payload },
    window.location.origin
  );
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data) return;
  if (event.data.type === "eth:send") {
    chrome.runtime.sendMessage(event.data.payload); // Relay the message to the extension
  }
  if (event.data.type === "web3pro:get-mm") {
    chrome.storage.sync.get("__web3proAppearAsMM__", function (result) {
      let mmAppear = result["__web3proAppearAsMM__"];
      try {
        mmAppear = JSON.parse(mmAppear);
      } catch (e) {
        mmAppear = false;
      }
      window.postMessage(
        { type: "web3pro:mm", payload: mmAppear },
        window.location.origin
      );
    });
  }
});

// Inject the script into the page
const scriptElement = document.createElement("script");
scriptElement.src = chrome.runtime.getURL("inject.js"); // Points to your inject.js file in the extension's directory
scriptElement.onload = () => scriptElement.remove(); // Remove the script tag after it has been executed
(document.head || document.documentElement).appendChild(scriptElement);
