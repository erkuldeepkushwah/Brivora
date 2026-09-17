// Replace financial demo text with IT services text on home, about, blog and course pages
// (services page was already updated by scripts/update-services-text.mjs)
// Usage: node scripts/update-pages-text.mjs
import fs from "node:fs";

const FILES = {
  "app/page.tsx": [
    ["Let’s make finance feel simpler!", "Let’s make technology work for you!"],
    ["Clear financial guidance for your business", "Clear IT solutions for your business"],
    ["We offer expert finance guidance designed to support performance, long-term stability, and sustainable growth.", "We offer expert technology services designed to support performance, long-term stability, and sustainable growth."],
    ["Best-in-class financial professionals", "Best-in-class IT professionals"],
    ["Financial expertise you can trust", "Technical expertise you can trust"],
    // Services preview cards – same wording as the services page
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
    // About agency section
    ["Your partners in smart financial planning", "Your partners in smart technology solutions"],
    ["We support businesses and individuals with practical financial advice", "We support businesses of all sizes with practical technology solutions"],
    ["build stable, sustainable financial futures", "build stable, sustainable digital growth"],
    ["Practical financial guidance", "Practical IT guidance"],
    // Who we work with
    ["Smart financial solutions for every business", "Smart technology solutions for every business"],
    ["providing tailored financial guidance, practical solutions, and long-term support to help them achieve stability, growth, and confidence in their financial decisions", "providing tailored technology solutions, practical guidance, and long-term support to help them achieve stability, growth, and confidence in their business decisions"],
    ["Expert financial support and planning for startups and small businesses to manage risks and thrive.", "Expert IT support and solutions for startups and small businesses to manage risks and thrive."],
    ["Providing businesses tailored guidance and expert insight to drive growth and long-term financial success.", "Providing businesses tailored guidance and expert insight to drive growth and long-term success."],
    // What you'll gain
    ["The benefits of expert financial support and planning", "The benefits of expert IT support and planning"],
    ["Improve financial visibility", "Improve online visibility"],
    ["Understand your finances and uncover opportunities for growth.", "Understand your digital presence and uncover opportunities for growth."],
    ["Reduce financial uncertainty", "Reduce technical uncertainty"],
    ["Good decisions start with clear numbers.", "Good decisions start with clear thinking."],
    ["strengthen financial resilience", "strengthen their digital capabilities"],
    // Client stories
    ["Unlocked over $250,000 in annual cash flow", "Increased online sales by 60% in six months"],
    ["18% reduction in tax liabilities", "60% growth in online sales"],
    ["The team helped us identify tax-saving opportunities we had previously overlooked and implemented a structured planning approach that reduced our annual tax liabilities by more than 18%. ", "The team helped us spot performance issues we had previously overlooked and implemented a structured optimization approach that increased our website speed by more than 60%. "],
    ["GreenLeaf Enterprises – Finance Director", "GreenLeaf Enterprises – Operations Director"],
    ["Through proactive tax planning and ongoing guidance, we improved our tax position while maintaining full compliance. The additional cash flow allowed us to reinvest confidently in key business initiatives.", "Through proactive system monitoring and ongoing guidance, we improved our platform performance while maintaining full reliability. The additional efficiency allowed us to reinvest confidently in key business initiatives."],
    ["Lumen Inovations – Finance Director", "Lumen Inovations – Operations Director"],
    ["The review process provided valuable insight into our financial structure", "The technical audit provided valuable insight into our systems"],
    ["Identified more than 12 tax-saving opportunities", "Delivered more than 12 successful software projects"],
    ["Their expertise helped us navigate complex tax regulations and identify practical ways to improve financial efficiency.", "Their expertise helped us navigate complex technical challenges and identify practical ways to improve system performance."],
    ["Expert guidance through complex tax requirements", "Expert guidance through complex technology requirements"],
    ["Meaningful savings without compromising compliance", "Faster delivery without compromising quality"],
    ["Working with their team allowed us to take a more strategic approach to tax planning. Their recommendations helped reduce unnecessary liabilities while supporting our long-term financial goals.", "Working with their team allowed us to take a more strategic approach to technology planning. Their recommendations helped cut unnecessary costs while supporting our long-term goals."],
    ["Expert strategic financial support for long-term success", "Expert strategic technology support for long-term success"],
    // Blog preview cards
    ["How technology is changing financial management", "How AI is transforming web development"],
    ["Expanding our financial advisory services", "Expanding our IT service offerings"],
    ["Why proactive tax planning matters for business success", "Why website performance matters for business success"],
  ],
  "app/about/page.tsx": [
    ["About our company – Block Editor Business", "About our company – Brivora"],
    ["We help businesses make smart financial decisions", "We help businesses grow with smart technology solutions"],
    ["Financial transparency", "Transparent communication"],
    ["Financial Strategy Lead", "Technology Strategy Lead"],
    ["navigate financial challenges", "navigate technology challenges"],
    ["innovative financial advisory solutions", "innovative technology solutions"],
    ["advanced financial planning, risk management, and performance tracking", "advanced web development, mobile apps, and cloud solutions"],
    ["tailored financial strategies, actionable insights, and sustainable results", "tailored technology solutions, actionable insights, and sustainable results"],
    ["Strategic financial solutions for long-term success", "Strategic technology solutions for long-term success"],
  ],
  "app/blog/page.tsx": [
    ["Blog 2 – Block Editor Business", "Blog – Brivora"],
    ["Blog 2", "Blog"],
    ["How technology is changing financial management", "How AI is transforming web development"],
    ["Expanding our financial advisory services", "Expanding our IT service offerings"],
    ["Why proactive tax planning matters for business success", "Why website performance matters for business success"],
    ["Why every business needs a financial roadmap", "Why every business needs a digital roadmap"],
    ["How financial planning supports better business decisions", "How technology planning supports better business decisions"],
    ["Why more businesses are investing in financial technology", "Why more businesses are investing in cloud technology"],
    ["Why financial planning Is essential for sustainable business growth", "Why a strong digital presence is essential for sustainable business growth"],
    ["Launching our enhanced business advisory services", "Launching our enhanced IT support services"],
  ],
  "app/course/page.tsx": [
    ["Courses – Block Editor Business", "Courses – Brivora"],
    ["18% reduction in business tax liabilities", "60% growth in online sales"],
    ["A structured tax strategy helped Lumora Laser Technologies reduce liabilities, improve compliance, and increase cash flow. ", "A modern web platform helped Lumora Laser Technologies reach more customers, automate orders, and increase online sales. "],
    ["Tax optimization", "Web development"],
    ["Risk & compliance", "E-commerce solutions"],
    ["Creating stronger compliance oversight and greater operational control across Wander Wave Stores locations. ", "Creating stronger digital oversight and greater operational control across Wander Wave Stores locations. "],
    ["Strategic financial advisory helped Vertex Group Developments strengthen planning, forecasting, and investment decisions. ", "A custom mobile app helped Vertex Group Developments strengthen planning, forecasting, and project decisions. "],
    ["Financial advisory", "Mobile app development"],
    ["15% improvement in capital allocation efficiency", "40% improvement in team productivity"],
  ],
};

for (const [file, rules] of Object.entries(FILES)) {
  let s = fs.readFileSync(file, "utf8");
  for (const [from, to] of rules) {
    if (!s.includes(from)) {
      console.error("NOT FOUND in " + file + ": " + from);
      process.exit(1);
    }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
  console.log("updated " + file + " (" + rules.length + " replacements)");
}
