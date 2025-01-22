// Log installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Smart Tab Manager installed!");
});

// Track tab activity
chrome.tabs.onActivated.addListener(({ tabId }) => {
  const now = Date.now();

  chrome.storage.local.get("tabUsage", (data) => {
    const tabUsage = data.tabUsage || {};
    tabUsage[tabId] = now; // Update the timestamp for the active tab

    chrome.storage.local.set({ tabUsage }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error storing tab usage:", chrome.runtime.lastError);
      } else {
        console.log(`Updated tabUsage: Tab ${tabId} at ${new Date(now)}`);
      }
    });
  });
});
