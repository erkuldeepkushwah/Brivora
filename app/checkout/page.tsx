export const metadata = { title: "Checkout – Brivora" };

export default function CheckoutPage() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style dangerouslySetInnerHTML={{ __html: `
.co-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 20px; }
.co-card { background: #fff; border: 1px solid #dde4ee; border-radius: 8px; padding: 42px 36px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 6px 24px rgba(2,6,23,.06); }
.co-ico { width: 56px; height: 56px; margin: 0 auto 18px; border-radius: 50%; background: #eef6ff; color: #165dfc; font-size: 26px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.co-card h1 { font-size: 22px; font-weight: 600; color: #0f172a; margin: 0 0 8px; }
.co-card p { font-size: 14.5px; color: #64748b; line-height: 1.6; margin: 0 0 24px; }
.co-btn { display: inline-block; background: #165dfc; color: #fff; font-size: 14.5px; font-weight: 600; padding: 12px 26px; border-radius: 6px; text-decoration: none; }
.co-btn:hover { background: #0d45e8; }
.co-note { margin-top: 16px; font-size: 12.5px; color: #94a3b8; }
` }} />
      <div className="co-wrap">
        <div className="co-card">
          <div className="co-ico">₹</div>
          <h1>Opening checkout…</h1>
          <p>Aapko apne dashboard ke secure payment page par le jaa rahe hain. Agar automatically nahi khula, to niche ke button par click karein.</p>
          <a className="co-btn" id="co-go" href="../dashboard/">Open Payment Page</a>
          <div className="co-note">Pehle login karna zaroori hai.</div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
(function () {
  var q = new URLSearchParams(location.search).get('courseId');
  var b = location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : '';
  var u = b + '/dashboard/' + (q ? ('?pay=' + encodeURIComponent(q)) : '');
  var a = document.getElementById('co-go');
  if (a) a.setAttribute('href', u);
  location.replace(u);
})();` }} />
    </>
  );
}
