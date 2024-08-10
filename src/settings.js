/* globals chrome */

function mmAppearToggle () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

    const url = tabs[0].url;
    // Check if the tab's URL is a chrome:// URL
    if (url.startsWith('chrome://')) {
      console.warn('Cannot execute script on chrome:// URLs');
      return;
    }

    if (tabs[0]) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () =>  {
            return new Promise((resolve) => {
              chrome.storage.sync.get(['__web3proAppearAsMM__'], function(result) {
                resolve(result.__web3proAppearAsMM__);
              });
            });
          }
        },
        (results) => {
        let mmAppear = false
        if (results) {
          try {
            mmAppear = JSON.parse(results[0].result)
          } catch (e) {
            mmAppear = false
          }
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (mmAppear) => {
              // Use chrome.storage.sync.set to update the value in storage
              chrome.storage.sync.set({'__web3proAppearAsMM__': !mmAppear}, function() {
                console.log('Value is set to ' + !mmAppear);
                // Once the value is set, reload the page
                window.location.reload();
              });
            },
            args: [mmAppear] // Pass mmAppear as an argument
          });
          
        }
        window.close()
      })
    }
  })
}

const getOrigin = url => {
  const path = url.split('/')
  return path[0] + '//' + path[2]
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('mmAppearToggle').addEventListener('click', mmAppearToggle)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

    const url = tabs[0].url;
    // Check if the tab's URL is a chrome:// URL
    if (url.startsWith('chrome://')) {
      console.warn('Cannot execute script on chrome:// URLs');
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () =>  {
          return new Promise((resolve) => {
            chrome.storage.sync.get(['__web3proAppearAsMM__'], function(result) {
              resolve(result.__web3proAppearAsMM__);
            });
          });
        }
      },
      (results) => {
      let mmAppear = false

        console.log('Results:', results)

      if (results) {
        try {
          mmAppear = JSON.parse(results[0].result)
        } catch (e) {
          mmAppear = false
        }
      }
      const toggle = document.getElementById('mmAppearToggle')
      const injecting = document.getElementById('mmAppearDescription')
      const sub = document.getElementById('mmAppearSub')
      if (mmAppear) {
        toggle.innerHTML = '<span>Appear As <span class=\'web3pro\'>Web3Pro</span> Instead </span>'
        injecting.innerHTML = '<span>Injecting as <span class=\'mm\'>Metamask</span> </span>'
      } else {
        toggle.innerHTML = '<span>Appear As <span class=\'mm\'>MetaMask</span> Instead </span>'
        injecting.innerHTML = '<span>Injecting as <span class=\'web3pro\'>Web3Pro</span> </span>'
      }
      sub.innerHTML = `${getOrigin(tabs[0].url)}`
    })
  })
})
