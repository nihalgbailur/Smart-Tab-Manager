// Track last active times
let tabUsageData = {};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await updateStats();
  await categorizeTabs();
});

// Add event listeners
document.getElementById("categorize").addEventListener("click", categorizeTabs);
document.getElementById("closeInactive").addEventListener("click", closeInactiveTabs);

// Update statistics
async function updateStats() {
  const tabs = await chrome.tabs.query({});
  const stats = document.getElementById("stats");
  stats.textContent = `Total tabs: ${tabs.length}`;
}

// Categorize tabs
async function categorizeTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const categorizedTabs = organizeTabs(tabs);
    
    const tabList = document.getElementById("tab-list");
    tabList.innerHTML = ""; // Clear existing list
    
    for (const [category, tabs] of Object.entries(categorizedTabs)) {
      if (tabs.length === 0) continue; // Skip empty categories
      
      const categoryEl = document.createElement("div");
      categoryEl.className = "category";
      categoryEl.innerHTML = `
        <strong>${category}</strong> (${tabs.length})
        <ul>
          ${tabs.map(tab => `
            <li>
              <a href="#" data-tab-id="${tab.id}" title="${tab.title}">
                ${tab.title}
              </a>
            </li>
          `).join("")}
        </ul>
      `;
      
      // Add click handlers for tab links
      categoryEl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const tabId = parseInt(e.target.dataset.tabId);
          chrome.tabs.update(tabId, { active: true });
          chrome.tabs.get(tabId, (tab) => {
            chrome.windows.update(tab.windowId, { focused: true });
          });
        });
      });
      
      tabList.appendChild(categoryEl);
    }
  } catch (error) {
    console.error("Error categorizing tabs:", error);
  }
}

// Close inactive tabs
async function closeInactiveTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const storage = await chrome.storage.local.get("tabUsage");
    const tabUsage = storage.tabUsage || {};
    
    const threshold = Date.now() - (30 * 60 * 1000); // 30 minutes
    const inactiveTabs = tabs.filter(tab => {
      const lastUsed = tabUsage[tab.id] || Date.now();
      return lastUsed < threshold;
    });
    
    if (inactiveTabs.length > 0) {
      if (confirm(`Close ${inactiveTabs.length} inactive tabs?`)) {
        await Promise.all(inactiveTabs.map(tab => chrome.tabs.remove(tab.id)));
        await updateStats();
        await categorizeTabs();
      }
    } else {
      alert("No inactive tabs found!");
    }
  } catch (error) {
    console.error("Error closing inactive tabs:", error);
  }
}

// Improved tab categorization
function organizeTabs(tabs) {
  const categories = {
    Work: [],
    Development: [],
    Social: [],
    Entertainment: [],
    Shopping: [],
    Research: [],
    Uncategorized: []
  };

  const patterns = {
    Work: /(docs|sheets|slides|office|work|business|linkedin|trello|asana)/i,
    Development: /(github|stackoverflow|code|dev|localhost|api|debug)/i,
    Social: /(facebook|twitter|instagram|social|chat|messenger)/i,
    Entertainment: /(youtube|netflix|spotify|music|video|game)/i,
    Shopping: /(amazon|shop|store|cart|checkout|ebay)/i,
    Research: /(research|wiki|scholar|study|learn|course)/i
  };

  tabs.forEach(tab => {
    const url = tab.url.toLowerCase();
    const title = tab.title.toLowerCase();
    
    let categorized = false;
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(url) || pattern.test(title)) {
        categories[category].push(tab);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.Uncategorized.push(tab);
    }
  });

  return categories;
}
  