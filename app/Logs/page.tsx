import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Logos" };

export default function LogsPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Logs", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
