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

const template = fs.readFileSync(
  path.join(__dirname, "page-template.txt"),
  "utf8"
);

for (const [page, title] of Object.entries(pages)) {
  const pagePath = path.join("app", page, "page.tsx");
  if (!fs.existsSync(pagePath)) {
    console.log(`skip ${page} (no page.tsx)`);
    continue;
  }
  const current = fs.readFileSync(pagePath, "utf8");
  const m = current.match(/const html = (".*");/);
  if (!m) {
    console.log(`skip ${page} (no embedded html)`);
    continue;
  }
  const htmlStr = m[1];
  let tsx = template;
  tsx = tsx.replace("__TITLE__", () => JSON.stringify(title));
  tsx = tsx.replace("__HTML__", () => htmlStr);
  tsx = tsx.replace("__COMPONENT__", () => page);
  fs.writeFileSync(pagePath, tsx);
  console.log(`rewrote ${page}: ${tsx.length} bytes`);
}

// remove the shared component
fs.rmSync(path.join("app", "components"), { recursive: true, force: true });
console.log("removed app/components");
console.log("done");
