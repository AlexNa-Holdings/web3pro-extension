const EventEmitter = require("events");
const EthereumProvider = require("ethereum-provider");

class Connection extends EventEmitter {
  constructor() {
    super();
    window.addEventListener("message", (event) => {
      if (!event || !event.data || !event.data.type) return;
      if (event.source !== window) return;

      switch (event.data.type) {
        case "eth:payload":
          this.emit("payload", event.data.payload);
          break;
        case "accountsChanged":
          this.emit("accountsChanged", event.data.payload);
          break;
        case "chainChanged":
          this.emit("chainChanged", event.data.payload);
          break;
      }
    });
    setTimeout(() => this.emit("connect"), 0);
  }

  send(payload) {
    window.postMessage({ type: "eth:send", payload }, window.location.origin);
  }
}

window.addEventListener("message", (event) => {
  if (!event || !event.data || !event.data.type) return;
  if (event.source !== window) return;
  if (event.data.type === "web3pro:mm") {
    mmAppear = JSON.stringify(event.data.payload);

    if (mmAppear) {
      class MetaMaskProvider extends EthereumProvider {}
      try {
        window.ethereum = new MetaMaskProvider(new Connection());
        window.ethereum.isMetaMask = true;
        window.ethereum._metamask = {
          isUnlocked: () => true,
        };
        window.ethereum.setMaxListeners(0);
      } catch (e) {
        console.error("Web3Pro Error:", e);
      }
    } else {
      class Web3ProProvider extends EthereumProvider {}
      try {
        window.ethereum = new Web3ProProvider(new Connection());
        window.ethereum.isWeb3Pro = true;
        window.ethereum.setMaxListeners(0);
        console.log("appear as Web3Pro");
      } catch (e) {
        console.error("Web3Pro Error:", e);
      }
    }

    console.log("window.ethereum", window.ethereum);
  }
});

window.postMessage({ type: "web3pro:get-mm" }, window.location.origin);
