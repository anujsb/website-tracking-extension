let activeTabId = null;
let activeTabStartTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await trackActiveTime();
  activeTabId = activeInfo.tabId;
  activeTabStartTime = Date.now();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    await trackActiveTime();
    activeTabStartTime = Date.now();
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === activeTabId) {
    await trackActiveTime();
    activeTabId = null;
    activeTabStartTime = null;
  }
});

async function trackActiveTime() {
  if (activeTabId === null || activeTabStartTime === null) return;
  
  const endTime = Date.now();
  const duration = endTime - activeTabStartTime;
  const tab = await chrome.tabs.get(activeTabId);
  const url = new URL(tab.url);
  const domain = url.hostname;

  chrome.storage.local.get([domain], (result) => {
    const totalTime = (result[domain] || 0) + duration;
    chrome.storage.local.set({ [domain]: totalTime });
  });
}