import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Case studies" };

export default function StudiesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Studies", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
