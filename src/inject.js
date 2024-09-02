import EventEmitter from "events";
import Provider from "ethereum-provider";

console.log("Web3Pro Injected");

class Web3ProProvider extends Provider {}

class Connection extends EventEmitter {
  constructor() {
    super();
    window.addEventListener("message", (event) => {
      console.log("inject from window: ", event.data);

      if (event && event.source === window && event.data) {
        switch (event.data.type) {
          case "web3pro:connected":
            this.emit("connect");
            break;
          case "web3pro:disconnected":
            this.emit("disconnect");
            break;
          case "web3pro:mm":
            var mmAppear;
            mmAppear = JSON.stringify(event.data.payload);
            window.ethereum.isMetaMask = mmAppear;
          case "eth:payload":
            this.emit("payload", event.data.payload);
//            this.emit("payload", typeof event.data.payload === 'string' ? event.data.payload : JSON.stringify(event.data.payload));
            break;
        }
      }
    });
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

window.postMessage({ type: "web3pro:get-mm" }, window.location.origin);
window.postMessage({ type: "web3pro:request-status" }, window.location.origin);
