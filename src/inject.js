import EventEmitter from "events";
import Provider from "ethereum-provider";

console.log("Web3Pro Injected");

class Web3ProProvider extends Provider {
  // resumeSubscriptions() {
  //   Object.keys(this.eventHandlers).forEach((event) => {
  //     if (!this.listenerCount(event) && !this.attemptedSubscription(event)) //fixed bug in ethereum-provider
  //       this.startSubscription(event);
  //   });
  // }
}

class Connection extends EventEmitter {
  constructor() {
    super();
    window.addEventListener("message", (event) => {
      if (
        event &&
        event.source === window &&
        event.data &&
        event.data.type === "eth:payload"
      ) {
        console.log("emit: event.data.payload", event.data.payload);

        this.emit("payload", event.data.payload);
      }
    });
    setTimeout(() => {
      this.emit("connect");
    }, 0);
  }

  send(payload) {
    window.postMessage({ type: "eth:send", payload }, window.location.origin);
  }
}

try {
  window.ethereum = new Web3ProProvider(new Connection());
  window.ethereum.isWeb3Pro = true;
  window.ethereum._metamask = {
    isUnlocked: () => true,
  };
} catch (e) {
  console.error("Web3Pro Init Provider Error:", e);
}

window.addEventListener("message", (event) => {
  if (!event || !event.data || !event.data.type) return;
  if (event.source !== window) return;
  if (event.data.type === "web3pro:mm") {
    var mmAppear
    mmAppear = JSON.stringify(event.data.payload);
    window.ethereum.isMetaMask = mmAppear;
  }
});

window.postMessage({ type: "web3pro:get-mm" }, window.location.origin);
