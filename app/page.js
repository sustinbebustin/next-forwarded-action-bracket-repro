import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Forwarded Server Action repro</h1>
      <p>
        <Link href="/items/1/edit">Edit item 1</Link>
      </p>
    </main>
  );
}
