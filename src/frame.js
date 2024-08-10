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

let mmAppear = window.localStorage.getItem('__web3proAppearAsMM__')

try {
  mmAppear = JSON.parse(mmAppear)
} catch (e) {
  mmAppear = false
}

if (mmAppear) {
  class MetaMaskProvider extends EthereumProvider { }

  try {
    window.ethereum = new MetaMaskProvider(new Connection())
    window.ethereum.isMetaMask = true
    window.ethereum._metamask = {
      isUnlocked: () => true
    }
    window.ethereum.setMaxListeners(0)
  } catch (e) {
    console.error('Frame Error:', e)
  }
} else {
  class FrameProvider extends EthereumProvider { }

  try {
    window.ethereum = new FrameProvider(new Connection())
    window.ethereum.isFrame = true
    window.ethereum.setMaxListeners(0)
  } catch (e) {
    console.error('Frame Error:', e)
  }
}
