export default function NotFound() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "40px" }}>
      <h1 style={{ fontSize: "3rem", margin: "0 0 12px" }}>404</h1>
      <p style={{ fontSize: "1.2rem", color: "#555", margin: "0 0 24px" }}>Page not found</p>
      <a href="/" style={{ display: "inline-block", padding: "12px 28px", background: "#0a3d62", color: "#fff", textDecoration: "none", borderRadius: "6px", fontWeight: 600 }}>
        Go to homepage
      </a>
    </main>
  );
}
