export const metadata = { title: "Redirecting… – Brivora" };

export default function Page() {
  return (
    <>
      <div style={{ fontFamily: "Inter, Arial, sans-serif", color: "#64748b", padding: "48px 24px", textAlign: "center" }}>
        Redirecting to your dashboard…
      </div>
      <script dangerouslySetInnerHTML={{ __html: "(function(){var b=location.pathname.indexOf('/Brivora')===0?'/Brivora':'';location.replace(b+'/user/expert/');})();" }} />
    </>
  );
}
