import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="thanks">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>Let’s get you back home.</h1>
      <p>This page is no longer here. Our team still is.</p>
      <Link href="/" className="button">
        Back to WeRoof
      </Link>
    </main>
  );
}
