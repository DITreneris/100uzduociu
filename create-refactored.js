/**
 * Create refactored index.html with external CSS and JS
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index-original.html'), 'utf-8');

// Find body start and script start
const bodyStart = html.indexOf('<body>');
const scriptStart = html.indexOf('<script>');
const footerEnd = html.indexOf('</footer>');

if (bodyStart === -1 || scriptStart === -1) {
  console.log('Could not find body or script tags');
  process.exit(1);
}

// Extract body content (without scripts)
const bodyContent = html.substring(bodyStart, scriptStart);

// Find footer end
const footerContent = html.substring(footerEnd + '</footer>'.length, scriptStart).trim();

const newHtml = `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b5bd3">
  
  <title>Praktinių promptų rinkinys — 110 užduočių kasdieniam darbui su DI</title>
  <meta name="description" content="Išsami 110 praktinių užduočių kasdieniam darbui su DI rinktinė pardavimų, pirkimų, logistikos, e. komercijos, dizaino, duomenų analizės, rinkodaros, IT, finansų, personalo, asmeninio efektyvumo skyriuose ir išplėstiniai promptų šablonai.">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Praktinių promptų rinkinys — 110 užduočių kasdieniam darbui su DI">
  <meta property="og:description" content="Išsami 110 praktinių užduočių kasdieniam darbui su DI rinktinė.">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:title" content="Praktinių promptų rinkinys — 110 užduočių kasdieniam darbui su DI">
  <meta name="twitter:card" content="summary">
  
  <!-- External CSS -->
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
${bodyContent}
  <!-- External JavaScript -->
  <script src="assets/js/app.js" defer></script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), newHtml, 'utf-8');

console.log('✅ Created index.html');
console.log('   Original size: ' + Math.round(html.length / 1024) + ' KB');
console.log('   New size: ' + Math.round(newHtml.length / 1024) + ' KB');
console.log('   Reduction: ' + Math.round((1 - newHtml.length / html.length) * 100) + '%');
