import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "About our company" };

export default function AboutPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "About", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
