const fs = require("fs");
const path = require("path");

const pages = {
  About: "About our company",
  Blog: "Blog",
  Contact: "Contact",
  Course: "Courses",
  Home: "Brivora",
  Login: "Login",
  Logs: "Logos",
  Service: "Our services",
  Studies: "Case studies",
};

for (const [page, title] of Object.entries(pages)) {
  const htmlPath = path.join("app", page, "page.html");
  if (!fs.existsSync(htmlPath)) {
    console.log(`skip ${page} (no page.html)`);
    continue;
  }
  const html = fs.readFileSync(htmlPath, "utf8");
  const tsx =
    `import HtmlPage from "../components/HtmlPage";\n\n` +
    `export const metadata = { title: ${JSON.stringify(title)} };\n\n` +
    `const html = ${JSON.stringify(html)};\n\n` +
    `export default function ${page}Page() {\n` +
    `  return <HtmlPage html={html} />;\n` +
    `}\n`;
  fs.writeFileSync(path.join("app", page, "page.tsx"), tsx);
  fs.rmSync(htmlPath);
  console.log(`converted ${page}: page.tsx ${tsx.length} bytes`);
}
console.log("done");
