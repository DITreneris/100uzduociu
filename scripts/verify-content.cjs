const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const errors = [];
const EXPECTED_PROMPT_TOTAL = 110;

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

const promptCardCount = countMatches(html, /<article class="prompt-card/g);
const copyButtonCount = countMatches(html, /class="btn-copy"/g);
assert(
  promptCardCount === EXPECTED_PROMPT_TOTAL,
  `Expected ${EXPECTED_PROMPT_TOTAL} prompt cards, found ${promptCardCount}`
);
assert(
  copyButtonCount === promptCardCount,
  `Expected copy button count (${copyButtonCount}) to match prompt cards (${promptCardCount})`
);

const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert(duplicateIds.length === 0, `Duplicate HTML ids found: ${duplicateIds.join(', ')}`);

assert(!html.includes('href="#"'), 'Placeholder links with href="#" remain in index.html');
assert(html.includes('id="mobile-search-modal"'), 'Mobile search modal markup is missing');
assert(html.includes('id="mobile-search-btn"'), 'Mobile search button markup is missing');

const deptStarts = [...html.matchAll(/<div class="dept [^"]*" id="([^"]+)"/g)].map(match => ({
  id: match[1],
  index: match.index,
}));

assert(deptStarts.length > 0, 'No department sections found in index.html');

let promptsInDepartments = 0;
for (const [index, dept] of deptStarts.entries()) {
  const end = index + 1 < deptStarts.length ? deptStarts[index + 1].index : html.indexOf('</section>', dept.index);
  const chunk = html.slice(dept.index, end === -1 ? undefined : end);
  const sectionPromptCount = countMatches(chunk, /<article class="prompt-card/g);
  const badgeText = (chunk.match(/<span class="dept__badge">([^<]+)<\/span>/) || [])[1] || '';
  const badgeCount = Number((badgeText.match(/\d+/) || [])[0]);

  promptsInDepartments += sectionPromptCount;
  assert(sectionPromptCount > 0, `Department ${dept.id} has no prompt cards`);
  assert(Number.isFinite(badgeCount), `Badge for ${dept.id} does not contain a number: ${badgeText}`);
  assert(
    badgeCount === sectionPromptCount,
    `Badge for ${dept.id} (${badgeText}) does not match ${sectionPromptCount} prompt cards`
  );
}

assert(
  promptsInDepartments > 0 && promptsInDepartments <= promptCardCount,
  `Department prompt total (${promptsInDepartments}) is outside expected page total range (${promptCardCount})`
);

if (errors.length) {
  console.error('Content verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Content verification passed: ${promptCardCount} prompt cards, ${copyButtonCount} copy buttons, ${deptStarts.length} departments.`
);
