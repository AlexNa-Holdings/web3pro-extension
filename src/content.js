// relay messages from the extension to the page and vice versa
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log("content: got from bg", data);

  window.postMessage(
    { type: data.type, payload: data },
    window.location.origin
  );
});

window.addEventListener("message", (event) => {
  console.log("content got from tab", event.data);

  if (event.source !== window) return;
  if (!event.data) return;
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
  chrome.runtime.sendMessage(event.data); // Relay the message to the extension 
});

