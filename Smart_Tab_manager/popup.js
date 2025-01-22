document.getElementById("categorize").addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});
    const categorizedTabs = categorizeTabs(tabs);
  
    const tabList = document.getElementById("tab-list");
    tabList.innerHTML = ""; // Clear existing list
    for (const [category, tabs] of Object.entries(categorizedTabs)) {
      const categoryEl = document.createElement("li");
      categoryEl.className = "category";
      categoryEl.innerHTML = `<strong>${category}</strong> (${tabs.length})`;
      const tabLinks = tabs.map(
        (tab) => `<li><a href="${tab.url}" target="_blank">${tab.title}</a></li>`
      ).join("");
      categoryEl.innerHTML += `<ul>${tabLinks}</ul>`;
      tabList.appendChild(categoryEl);
    }
  });
  
  // Categorize tabs based on keywords
  function categorizeTabs(tabs) {
    const categories = {
      Work: [],
      Personal: [],
      Research: [],
      Uncategorized: []
    };
  
    tabs.forEach(tab => {
      if (tab.url.includes("work") || tab.title.includes("Work")) {
        categories.Work.push(tab);
      } else if (tab.url.includes("youtube") || tab.title.includes("Video")) {
        categories.Personal.push(tab);
      } else if (tab.url.includes("docs") || tab.title.includes("Research")) {
        categories.Research.push(tab);
      } else {
        categories.Uncategorized.push(tab);
      }
    });
  
    return categories;
  }
  