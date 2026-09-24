export const metadata = { title: "Payment Received – Brivora" };

export default function PaymentSuccessPage() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style dangerouslySetInnerHTML={{ __html: `
.pp-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 20px; }
.pp-card { background: #fff; border: 1px solid #dde4ee; border-radius: 8px; padding: 46px 36px; max-width: 460px; width: 100%; text-align: center; box-shadow: 0 6px 24px rgba(2,6,23,.06); }
.pp-ico { width: 64px; height: 64px; margin: 0 auto 20px; border-radius: 50%; background: #eafff5; color: #00835b; font-size: 30px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.pp-card h1 { font-size: 24px; font-weight: 600; color: #0f172a; margin: 0 0 10px; }
.pp-card p { font-size: 14.5px; color: #64748b; line-height: 1.65; margin: 0 0 26px; }
.pp-btn { display: inline-block; background: #165dfc; color: #fff; font-size: 14.5px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none; }
.pp-btn:hover { background: #0d45e8; }
.pp-link { display: inline-block; margin-top: 14px; font-size: 13.5px; color: #165dfc; text-decoration: none; }
.pp-link:hover { text-decoration: underline; }
.pp-badge { display: inline-block; margin-bottom: 14px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #00835b; background: #eafff5; padding: 5px 12px; border-radius: 4px; }
` }} />
      <div className="pp-wrap">
        <div className="pp-card">
          <div className="pp-ico">✓</div>
          <span className="pp-badge">PAYMENT RECEIVED</span>
          <h1>Shukriya! Payment mil gaya</h1>
          <p>Aapka payment request submit ho gaya hai. Admin verify karne ke baad course aapke dashboard me automatically enroll ho jayega — status dashboard par live update hota rahega.</p>
          <a className="pp-btn" href="../../user/">Go to Dashboard</a>
          <br />
          <a className="pp-link" href="../../courses/">Browse more courses</a>
        </div>
      </div>
    </>
  );
}
