// Replace financial services text with IT services in app/services/page.tsx
// Usage: node scripts/update-services-text.mjs
import fs from "node:fs";

const FILE = "app/services/page.tsx";
let s = fs.readFileSync(FILE, "utf8");

const R = [
  ["Our services 2", "Our IT services"],
  ["Business financial advisory", "Web development"],
  ["Providing clear financial insight and guidance to support informed business decisions and long-term stability.", "Building fast, responsive, and secure websites tailored to your business goals and brand identity."],
  ["Financial planning & strategy", "Mobile app development"],
  ["Practical financial strategies designed to support stability, improve decision-making, and achieve long-term goals.", "Designing and building smooth, reliable mobile apps for Android and iOS that users love."],
  ["Tax planning & optimization", "UI/UX design"],
  ["Proactive tax strategies focused on reducing liabilities, improving efficiency, and supporting your financial position.", "Creating clean, intuitive interfaces and user experiences that keep customers engaged."],
  ["Investment advisory", "SEO & digital marketing"],
  ["Data-driven investment strategies aligned with your goals, risk tolerance, and long-term objectives.", "Data-driven SEO and marketing strategies that grow traffic, leads, and online visibility."],
  ["Risk management & compliance", "Cloud & DevOps"],
  ["Financial risk assessments and compliance guidance to protect your business and strengthen internal controls.", "Cloud infrastructure, deployment, and automation support to keep your systems fast and reliable."],
  ["Budgeting & cash flow management", "Maintenance & support"],
  ["Clear budgeting and cash flow strategies that improve financial control, planning, and business operations.", "Ongoing updates, monitoring, and technical support to keep your digital products running smoothly."],
  ["Expert financial guidance with long-term impact", "Expert IT guidance with long-term impact"],
  ["We work closely with our clients to understand their financial goals and challenges. By combining experience, clear analysis, and practical advice, we help businesses make confident decisions and achieve long-term, measurable results.", "We work closely with our clients to understand their technology goals and challenges. By combining experience, clear analysis, and practical advice, we help businesses make confident decisions and achieve long-term, measurable results."],
  ["Experienced financial specialists", "Experienced IT specialists"],
  ["We bring financial expertise and practical experience to support informed decisions and growth.", "We bring technical expertise and practical experience to support informed decisions and growth."],
  ["We deliver tailored advisory services that use resources efficiently while maximizing long-term value.", "We deliver tailored IT services that use resources efficiently while maximizing long-term value."],
  ["A clear, structured approach to financial decision-making", "A clear, structured approach to technology projects"],
  ["Business & financial assessment", "Business & technical assessment"],
  ["We begin by understanding your business, financial position, and objectives through a review of financial data, performance indicators, and key challenges.", "We begin by understanding your business, current systems, and objectives through a review of your infrastructure, workflows, and key challenges."],
  ["Together, we define clear financial goals and priorities. We develop a strategy aligned with your business needs, market conditions, and risk profile.", "Together, we define clear project goals and priorities. We develop a plan aligned with your business needs, budget, and timeline."],
  ["Financial planning & modeling", "Technical planning & architecture"],
  ["We create detailed financial plans, forecasts, and scenarios to support decision-making and evaluate opportunities before implementation.", "We create detailed technical plans, wireframes, and system designs to support decision-making before implementation."],
  ["We support the implementation of agreed strategies, working closely with your team to ensure actions are practical, timely, and effective.", "We support the implementation of agreed plans, working closely with your team to ensure delivery is practical, timely, and effective."],
  ["We track performance, review results, and adjust strategies as needed, providing ongoing advice to support sustainable growth.", "We monitor systems, review results, and make improvements as needed, providing ongoing support for sustainable growth."],
  ["Schedule a consultation with our finance experts to discuss your goals, challenges, and opportunities for growth.", "Schedule a consultation with our IT experts to discuss your goals, challenges, and opportunities for growth."],
];

let changed = 0;
for (const [from, to] of R) {
  if (!s.includes(from)) {
    console.error("NOT FOUND: " + from);
    process.exit(1);
  }
  s = s.split(from).join(to);
  changed++;
}
fs.writeFileSync(FILE, s);
console.log("replaced " + changed + " texts in " + FILE);
