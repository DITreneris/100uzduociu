/**
 * Extract prompts from index.html and generate prompts.json
 * Run: node extract-prompts.js
 */

const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Extract department sections
const deptRegex = /<div class="dept[^"]*"[^>]*id="([^"]+)"[^>]*data-dept="([^"]+)"[\s\S]*?<div class="dept__icon"[^>]*>([^<]+)<\/div>[\s\S]*?<h2 class="dept__title">([^<]+)<\/h2>[\s\S]*?<span class="dept__badge">(\d+) užduočių<\/span>/g;

// Extract prompt cards within sections
const promptCardRegex = /<article class="prompt-card"[^>]*data-keywords="([^"]*)"[^>]*>[\s\S]*?<h3 class="prompt-card__title">([^<]+)<\/h3>[\s\S]*?<p class="prompt-card__text">([^<]+)<\/p>[\s\S]*?data-copy="([^"]+)"[\s\S]*?<\/article>/g;

// Find all departments
const departments = [];
let match;

// Simple extraction - find each .dept section
const deptSectionRegex = /<div class="dept[^"]*" id="([^"]+)"[^>]*data-dept="([^"]+)"[\s\S]*?(?=<div class="dept[^"]*" id="|<\/section>)/g;

const sections = html.match(/<div class="dept[^"]*" id="[^"]+"[\s\S]*?<\/div>\s*<\/div>\s*(?=<div class="dept|<\/section>|<section)/g) || [];

console.log(`Found ${sections.length} department sections`);

// Extract data from main content area
const mainContent = html.match(/<section[^>]*id="prompts"[^>]*>[\s\S]*?<\/section>/);

if (!mainContent) {
  console.log('Could not find prompts section, trying alternative method...');
}

// Parse all prompt cards from the HTML
const allPrompts = [];
const promptPattern = /<article class="prompt-card"[^>]*data-keywords="([^"]*)"[^>]*>[\s\S]*?<h3 class="prompt-card__title">([^<]+)<\/h3>[\s\S]*?<p class="prompt-card__text">([\s\S]*?)<\/p>[\s\S]*?data-copy="([^"]+)"[\s\S]*?<\/article>/g;

let promptMatch;
while ((promptMatch = promptPattern.exec(html)) !== null) {
  const keywords = promptMatch[1].trim();
  const title = promptMatch[2].trim();
  const text = promptMatch[3].trim();
  const copyText = promptMatch[4].trim();
  
  // Avoid duplicates
  if (!allPrompts.find(p => p.title === title && p.text === text)) {
    allPrompts.push({
      id: allPrompts.length + 1,
      title,
      text,
      copyText,
      keywords: keywords.split(' ').filter(k => k.length > 0),
      category: guessCategory(keywords, title)
    });
  }
}

function guessCategory(keywords, title) {
  const kw = (keywords + ' ' + title).toLowerCase();
  
  if (kw.includes('agentas') || kw.includes('chain') || kw.includes('autonomin') || kw.includes('sistem')) {
    return 'advanced';
  } else if (kw.includes('darbuotoj') || kw.includes('interviu') || kw.includes('cv') || kw.includes('atostog') || kw.includes('hr') || kw.includes('pozicij')) {
    return 'hr';
  } else if (kw.includes('produktyvum') || kw.includes('susitik') || kw.includes('planavim') || kw.includes('pomidor') || kw.includes('efektyvum')) {
    return 'productivity';
  } else if (kw.includes('dizain') || kw.includes('infografik') || kw.includes('prezentacij') || kw.includes('vizual')) {
    return 'design';
  } else if (kw.includes('analiz') || kw.includes('excel') || kw.includes('csv') || kw.includes('ataskait') || kw.includes('dashboard') || kw.includes('kpi')) {
    return 'analytics';
  } else if (kw.includes('facebook') || kw.includes('instagram') || kw.includes('naujienlaiš') || kw.includes('rinkodar') || kw.includes('kampanij') || kw.includes('social')) {
    return 'marketing';
  } else if (kw.includes('seo') || kw.includes('kategorij') || kw.includes('e-kom') || kw.includes('parduotuv') || kw.includes('meta') || kw.includes('aprašym')) {
    return 'ecommerce';
  } else if (kw.includes('logistik') || kw.includes('sandėl') || kw.includes('pristat')) {
    return 'logistics';
  } else if (kw.includes('pirkim') || kw.includes('tiekėj')) {
    return 'procurement';
  } else if (kw.includes('it') || kw.includes('erp') || kw.includes('csv') || kw.includes('sistema')) {
    return 'it';
  } else if (kw.includes('pvm') || kw.includes('kain') || kw.includes('finans')) {
    return 'finance';
  } else {
    return 'sales';
  }
}

console.log(`\nExtracted ${allPrompts.length} unique prompts\n`);

// Group by category
const categories = {
  start: { name: 'Pradėti', icon: '🚀', prompts: [] },
  sales: { name: 'Pardavimai', icon: '💼', prompts: [] },
  procurement: { name: 'Pirkimai', icon: '📦', prompts: [] },
  logistics: { name: 'Logistika', icon: '🚚', prompts: [] },
  ecommerce: { name: 'E-komercija', icon: '🛒', prompts: [] },
  design: { name: 'Dizainas', icon: '🎨', prompts: [] },
  analytics: { name: 'Duomenų analizė', icon: '📊', prompts: [] },
  marketing: { name: 'Rinkodara', icon: '📢', prompts: [] },
  it: { name: 'IT', icon: '💻', prompts: [] },
  finance: { name: 'Finansai', icon: '💰', prompts: [] },
  hr: { name: 'Personalas', icon: '👥', prompts: [] },
  productivity: { name: 'Produktyvumas', icon: '⚡', prompts: [] },
  advanced: { name: 'Pažengusiems', icon: '🚀', prompts: [] }
};

// Add first 3 prompts to "start" category
allPrompts.slice(0, 3).forEach(p => {
  categories.start.prompts.push({ ...p, category: 'start' });
});

// Distribute the rest
allPrompts.slice(3).forEach(p => {
  if (categories[p.category]) {
    categories[p.category].prompts.push(p);
  } else {
    categories.sales.prompts.push(p);
  }
});

// Create final JSON structure
const data = {
  version: '2.0',
  totalPrompts: allPrompts.length,
  categories: Object.entries(categories)
    .filter(([_, cat]) => cat.prompts.length > 0)
    .map(([id, cat]) => ({
      id,
      name: cat.name,
      icon: cat.icon,
      count: cat.prompts.length,
      prompts: cat.prompts
    }))
};

// Write JSON file
const outputPath = path.join(__dirname, 'assets', 'data', 'prompts.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('Category breakdown:');
data.categories.forEach(cat => {
  console.log(`  ${cat.icon} ${cat.name}: ${cat.count} prompts`);
});

console.log(`\n✅ Generated ${outputPath}`);
console.log(`   Total: ${data.totalPrompts} prompts in ${data.categories.length} categories`);
