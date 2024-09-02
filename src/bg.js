const updatePopup = (isConnected) => {
  const popupFile = isConnected ? "settings.html" : "pop.html";
  chrome.action.setPopup({ popup: popupFile });
};

let webSocket = null;
let reconnectIntervalId;


function connectWebSocket() {
  webSocket = new WebSocket(
    "ws://127.0.0.1:9323/ws?identity=web3pro-extension"
  );

  webSocket.onopen = () => {
    console.log("WebSocket connected");
    if (reconnectIntervalId) {
      clearInterval(reconnectIntervalId);
      reconnectIntervalId = null;
    }
    updatePopup(true);

    // broadcast to all the subscribed tabs
    Object.keys(subs).forEach((sub) => {
      chrome.tabs.sendMessage(subs[sub].tabId, { method: "web3pro:connected" });
    });
  };

  webSocket.onclose = (event) => {
    console.log("WebSocket disconnected. Attempting to reconnect...");
    // Attempt to reconnect after a delay
    reconnectIntervalId = setTimeout(connectWebSocket, 5000);
    updatePopup(false);
    // broadcast to all the subscribed tabs
    Object.keys(subs).forEach((sub) => {
      chrome.tabs.sendMessage(subs[sub].tabId, { method: "web3pro:disconnected" });
    });
  };

  webSocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  webSocket.onmessage = function (event) {
    let payload;

    try {
      payload = JSON.parse(event.data);
    } catch (e) {
      console.error("Failed to parse WebSocket message:", event.data, e);
      return;
    }

    console.log("Received payload:", payload);

    if (typeof payload.id !== "undefined") {
      // Handle response to a previous request
      if (pending[payload.id]) {
        const { tabId, payloadId } = pending[payload.id];

        if (pending[payload.id].method === "eth_subscribe" && payload.result) {
          console.log("Received subscription ID:", payload.result);

          // Store the subscription in the subs object
          subs[payload.result] = {
            tabId,
            send: (subload) => {
              chrome.tabs.sendMessage(
                tabId,
                Object.assign({}, subload, { type: "eth:payload" })
              );
            },
          };

          console.log("Subs ->", subs);
        } else if (pending[payload.id].method === "eth_unsubscribe") {
          console.log("Received unsubscription response:", payload);

          // Handle unsubscription
          const params = payload.params ? [].concat(payload.params) : [];
          params.forEach((sub) => delete subs[sub]);
        }

        // Send the response back to the appropriate tab
        chrome.tabs.sendMessage(
          tabId,
          Object.assign({}, payload, { type: "eth:payload", id: payloadId })
        );

        // Clean up the pending request
        delete pending[payload.id];
      }
    } else if (payload.method && payload.method.indexOf("_subscription") > -1) {
      console.log("Received subscription payload:", payload);

      if (!payload.params || !payload.params.subscription) {
        console.error("Missing subscription ID in payload:", payload);
        return;
      }
      // Handle subscription notifications
      const subscriptionId = payload.params.subscription;
      if (subs[subscriptionId]) {
        subs[subscriptionId].send(payload);
      }
    }
  };
}

connectWebSocket();

const subs = {};
const pending = {};
var nextId = 1;

const getOrigin = (url) => {
  const path = url.split("/");
  return path[0] + "//" + path[2];
};

// Initially set the popup based on the WebSocket's readyState
if (webSocket && webSocket.readyState === WebSocket.OPEN) {
  updatePopup(true); // Already connected
} else {
  updatePopup(false); // Not connected yet
}

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log("bg got from tab:", data);

  if (data.type === "web3pro:request-status") {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      chrome.tabs.sendMessage(sender.tab.id, { type: "web3pro:connected" });
    } else {
      chrome.tabs.sendMessage(sender.tab.id, { type: "web3pro:disconnected" });
    }
  } else if (data.type === "eth:send") {
    const id = nextId++;
    pending[id] = {
      tabId: sender.tab.id,
      payloadId: data.payload.id,
      method: data.payload.method,
    };
    const load = Object.assign({}, data.payload, {
      id,
      __web3proOrigin: getOrigin(sender.url),
    });
    webSocket.send(JSON.stringify(load));
  }
});

const unsubscribeTab = (tabId) => {
  Object.keys(pending).forEach((id) => {
    if (pending[id].tabId === tabId) delete pending[id];
  });
  Object.keys(subs).forEach((sub) => {
    if (subs[sub].tabId === tabId) {
      const message = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_unsubscribe",
        params: [sub],
      };
      webSocket.send(JSON.stringify(message));
      delete subs[sub];
    }
  });
};

chrome.tabs.onRemoved.addListener((tabId, removed) => unsubscribeTab(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) unsubscribeTab(tabId);
});
