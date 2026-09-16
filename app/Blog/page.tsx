import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Blog" };

export default function BlogPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Blog", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
