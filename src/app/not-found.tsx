import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", background: "#FAF3EC", color: "#382216", textAlign: "center", padding: "10vh 1rem" }}>
        <p style={{ fontFamily: "monospace", color: "#7A6A5F" }}>— 404</p>
        <h1>Page not found</h1>
        <p><Link href="/en">Go home (EN)</Link> · <Link href="/ar">الرئيسية (AR)</Link></p>
      </body>
    </html>
  );
}
