import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Login" };

export default function LoginPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Login", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
