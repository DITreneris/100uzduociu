/**
 * Build Final index-v2.html with all prompts
 */

const fs = require('fs');
const path = require('path');

// Read the v2 template and migrated prompts
const v2Content = fs.readFileSync(path.join(__dirname, 'index-v2.html'), 'utf-8');
const migratedPrompts = fs.readFileSync(path.join(__dirname, 'migrated-prompts.html'), 'utf-8');

// Find the prompts container and replace its content
const containerStart = '<div id="prompts-container">';
const containerEnd = '</div>\n      </div>\n    </section>\n  </main>';

const startIndex = v2Content.indexOf(containerStart);
const endIndex = v2Content.indexOf('</div>\n      </div>\n    </section>\n  </main>', startIndex);

if (startIndex === -1) {
  console.log('Could not find prompts-container start');
  process.exit(1);
}

// Build the new content
const beforeContainer = v2Content.substring(0, startIndex + containerStart.length);
const afterContainer = v2Content.substring(v2Content.indexOf('</div>\n      </div>\n    </section>\n  </main>'));

const finalContent = beforeContainer + '\n' + migratedPrompts + '\n        ' + afterContainer;

// Write the final file
fs.writeFileSync(path.join(__dirname, 'index-v2.html'), finalContent, 'utf-8');

console.log('✅ index-v2.html updated with all 110 prompts!');
console.log('File size:', Math.round(finalContent.length / 1024), 'KB');
