import fs from "fs";
import path from "path";

const searchTerms = ["saveLetter", "createOfficialLetter", "EditorView", "ArsipView"];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
      const content = fs.readFileSync(fullPath, "utf-8");
      searchTerms.forEach(term => {
        if (content.includes(term)) {
          console.log(`Found '${term}' in: ${fullPath}`);
        }
      });
    }
  }
}

searchDir("src");
