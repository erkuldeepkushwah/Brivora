import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Brivora" };

export default function HomePage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Home", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
