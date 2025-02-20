// Log installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Smart Tab Manager installed!");
  // Initialize storage
  chrome.storage.local.set({ tabUsage: {} });
});

// Track tab activity
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const now = Date.now();
    const data = await chrome.storage.local.get("tabUsage");
    const tabUsage = data.tabUsage || {};
    
    tabUsage[tabId] = now;
    
    await chrome.storage.local.set({ tabUsage });
    console.log(`Updated tabUsage: Tab ${tabId} at ${new Date(now)}`);
  } catch (error) {
    console.error("Error tracking tab activity:", error);
  }
});

// Clean up removed tabs
chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const data = await chrome.storage.local.get("tabUsage");
    const tabUsage = data.tabUsage || {};
    
    delete tabUsage[tabId];
    
    await chrome.storage.local.set({ tabUsage });
  } catch (error) {
    console.error("Error cleaning up tab data:", error);
  }
});
