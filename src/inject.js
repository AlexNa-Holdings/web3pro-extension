const EventEmitter = require('events')
const EthereumProvider = require('ethereum-provider')

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => window.postMessage({type: 'eth:payload', payload: payload}, window.location.origin))
window.addEventListener('message', event => {
  if (event.source === window && event.data && event.data.type === 'eth:send') chrome.runtime.sendMessage(event.data.payload)
})

class Connection extends EventEmitter {
  constructor () {
    super()
    window.addEventListener('message', event => {
      if (event && event.source === window && event.data && event.data.type === 'eth:payload') {
        this.emit('payload', event.data.payload)
      }
    })
    setTimeout(() => this.emit('connect'), 0)
  }

  send (payload) {
    window.postMessage({ type: 'eth:send', payload }, window.location.origin)
  }
}

chrome.storage.sync.get('__web3proAppearAsMM__', function(result) {
  let mmAppear = result['__web3proAppearAsMM__'];
  try {
    mmAppear = JSON.parse(mmAppear)
  } catch (e) {
    mmAppear = false
  }

  console.log('appear as MM:', mmAppear)

  if (mmAppear) {
    class MetaMaskProvider extends EthereumProvider { }
    try {
      window.ethereum = new MetaMaskProvider(new Connection())
      window.ethereum.isMetaMask = true
      window.ethereum._metamask = {
        isUnlocked: () => true
      }
      window.ethereum.setMaxListeners(0)
      console.log('appear as MM')
    } catch (e) {
      console.error('Web3Pro Error:', e)
    }
  } else {
    class Web3ProProvider extends EthereumProvider { }
    try {
      window.ethereum = new Web3ProProvider(new Connection())
      window.ethereum.isWeb3Pro = true
      window.ethereum.setMaxListeners(0)
      console.log('appear as Web3Pro')
    } catch (e) {
      console.error('Web3Pro Error:', e)
    }
  }

  console.log('window.ethereum', window.ethereum)
  
});
