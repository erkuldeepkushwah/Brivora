import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Our services" };

export default function ServicePage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Service", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
