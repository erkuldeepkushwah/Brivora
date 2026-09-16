import fs from "node:fs";
import path from "node:path";
import HtmlPage from "../components/HtmlPage";

export const metadata = { title: "Courses" };

export default function CoursePage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "Course", "page.html"),
    "utf8"
  );
  return <HtmlPage html={html} />;
}
