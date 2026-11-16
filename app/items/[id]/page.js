import Link from "next/link";
import { connection } from "next/server";

import { readDraft } from "../../store";

// Does not import the Server Action, so its bundle does not own it.
export default async function ItemPage({ params }) {
  await connection();
  const { id } = await params;

  return (
    <main>
      <h1>Item {id}</h1>
      <p>
        Saved draft: <output>{readDraft(id) ?? "(nothing saved)"}</output>
      </p>
      <p>
        <Link href={`/items/${id}/edit`}>Edit</Link>
      </p>
    </main>
  );
}
