/**
 * Prompt Migration Script
 * 
 * This script extracts all prompts from the original index.html
 * and generates the new format for index-v2.html
 * 
 * Usage: node migrate-prompts.js
 */

const fs = require('fs');
const path = require('path');

// Read the original HTML file
const originalHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Regular expressions to extract prompts
const promptCardRegex = /<article class="prompt-card"[^>]*data-keywords="([^"]*)"[^>]*>[\s\S]*?<h3 class="prompt-card__title">([^<]+)<\/h3>[\s\S]*?<p class="prompt-card__text">([^<]+)<\/p>[\s\S]*?data-copy="([^"]+)"[\s\S]*?<\/article>/g;

// Extract department sections
const deptRegex = /<div class="dept [^"]*" id="([^"]+)"[^>]*data-dept="([^"]+)"[\s\S]*?<span class="dept__badge">(\d+) užduočių<\/span>/g;

// Extract all prompts
const prompts = [];
let match;

while ((match = promptCardRegex.exec(originalHtml)) !== null) {
  prompts.push({
    keywords: match[1],
    title: match[2].trim(),
    text: match[3].trim(),
    copyText: match[4].trim()
  });
}

console.log(`Found ${prompts.length} prompts in original file`);

// Generate new format HTML for each prompt
function generatePromptCard(prompt, index) {
  // Determine if this should have a chip
  const hasPopularChip = index < 5 || prompt.title.includes('SEO') || prompt.title.includes('El. laiškas');
  const hasQuickChip = prompt.text.length < 100;
  
  let chipsHtml = '';
  if (hasPopularChip) {
    chipsHtml = `
                  <div class="prompt-card__tags">
                    <span class="chip chip--popular">⭐ Populiaru</span>
                  </div>`;
  } else if (hasQuickChip) {
    chipsHtml = `
                  <div class="prompt-card__tags">
                    <span class="chip chip--quick">⚡ Greitas</span>
                  </div>`;
  }

  return `
                <!-- Prompt ${index + 1}: ${prompt.title} -->
                <article class="prompt-card" data-keywords="${prompt.keywords}">
                  <button class="btn-copy" data-prompt="${escapeHtml(prompt.copyText)}" aria-label="Kopijuoti">
                    <span aria-hidden="true">📋</span>
                    <span class="btn-copy__text">Kopijuoti</span>
                  </button>${chipsHtml}
                  <h3 class="prompt-card__title">${prompt.title}</h3>
                  <p class="prompt-card__text">${prompt.text}</p>
                </article>`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Group prompts by section (approximate based on original structure)
const sections = {
  business: { name: 'Verslas', icon: '💼', color: 'sales', count: 38, prompts: [] },
  ecommerce: { name: 'E-komercija', icon: '🛒', color: 'ecommerce', count: 13, prompts: [] },
  marketing: { name: 'Rinkodara', icon: '📢', color: 'marketing', count: 15, prompts: [] },
  analytics: { name: 'Duomenų analizė', icon: '📊', color: 'analytics', count: 12, prompts: [] },
  design: { name: 'Dizainas', icon: '🎨', color: 'design', count: 8, prompts: [] },
  productivity: { name: 'Produktyvumas', icon: '⚡', color: 'productivity', count: 10, prompts: [] },
  hr: { name: 'Personalo skyrius', icon: '👥', color: 'hr', count: 8, prompts: [] },
  advanced: { name: 'Pažengusiems', icon: '🚀', color: 'advanced', count: 6, prompts: [] }
};

// Assign prompts to sections based on keywords
prompts.forEach(prompt => {
  const kw = (prompt.keywords + ' ' + prompt.title).toLowerCase();
  
  if (kw.includes('agentas') || kw.includes('chain') || kw.includes('autonomin') || kw.includes('sistem')) {
    sections.advanced.prompts.push(prompt);
  } else if (kw.includes('darbuotoj') || kw.includes('interviu') || kw.includes('cv') || kw.includes('atostog') || kw.includes('hr') || kw.includes('pozicij')) {
    sections.hr.prompts.push(prompt);
  } else if (kw.includes('produktyvum') || kw.includes('susitik') || kw.includes('planavim') || kw.includes('laikas') || kw.includes('pomidor')) {
    sections.productivity.prompts.push(prompt);
  } else if (kw.includes('dizain') || kw.includes('infografik') || kw.includes('prezentacij') || kw.includes('vizual')) {
    sections.design.prompts.push(prompt);
  } else if (kw.includes('analiz') || kw.includes('excel') || kw.includes('csv') || kw.includes('ataskait') || kw.includes('dashboard') || kw.includes('kpi')) {
    sections.analytics.prompts.push(prompt);
  } else if (kw.includes('facebook') || kw.includes('instagram') || kw.includes('naujienlaiš') || kw.includes('rinkodar') || kw.includes('kampanij') || kw.includes('social')) {
    sections.marketing.prompts.push(prompt);
  } else if (kw.includes('seo') || kw.includes('e.') || kw.includes('kategorij') || kw.includes('e-kom') || kw.includes('parduotuv') || kw.includes('meta')) {
    sections.ecommerce.prompts.push(prompt);
  } else {
    sections.business.prompts.push(prompt);
  }
});

// Generate the full HTML for all sections
let outputHtml = '';

Object.entries(sections).forEach(([sectionId, section]) => {
  const promptsHtml = section.prompts.map((p, i) => generatePromptCard(p, i)).join('\n');
  
  outputHtml += `
          <!-- ${section.name.toUpperCase()} -->
          <div class="dept dept--${section.color}" id="${sectionId}" data-dept="${sectionId}">
            <button class="dept__trigger" aria-expanded="false" aria-controls="${sectionId}-content">
              <div class="dept__icon" aria-hidden="true">${section.icon}</div>
              <h2 class="dept__title">${section.name}</h2>
              <span class="dept__badge">${section.prompts.length} užduočių</span>
              <span class="dept__arrow" aria-hidden="true">▼</span>
            </button>
            <div class="dept__content" id="${sectionId}-content">
              <div class="prompts">${promptsHtml}
              </div>
            </div>
          </div>
`;
});

// Write output to file
fs.writeFileSync(path.join(__dirname, 'migrated-prompts.html'), outputHtml, 'utf-8');

console.log('\n✅ Migration complete!');
console.log('Output saved to: migrated-prompts.html');
console.log('\nSection summary:');
Object.entries(sections).forEach(([id, section]) => {
  console.log(`  ${section.icon} ${section.name}: ${section.prompts.length} prompts`);
});
console.log(`\nTotal prompts categorized: ${Object.values(sections).reduce((sum, s) => sum + s.prompts.length, 0)}`);
