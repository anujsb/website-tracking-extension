let activeTabId = null;
let startTime = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (activeTabId) {
    chrome.tabs.get(activeTabId, (tab) => {
      const endTime = new Date().getTime();
      const timeSpent = endTime - startTime;
      saveTime(tab.url, timeSpent);
    });
  }

  activeTabId = activeInfo.tabId;
  startTime = new Date().getTime();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    const endTime = new Date().getTime();
    const timeSpent = endTime - startTime;
    saveTime(tab.url, timeSpent);
    startTime = new Date().getTime();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    const endTime = new Date().getTime();
    const timeSpent = endTime - startTime;
    chrome.tabs.get(tabId, (tab) => {
      saveTime(tab.url, timeSpent);
    });
    activeTabId = null;
    startTime = null;
  }
});

function saveTime(url, timeSpent) {
  chrome.storage.local.get([url], (result) => {
    const totalTime = (result[url] || 0) + timeSpent;
    chrome.storage.local.set({ [url]: totalTime });
  });
}