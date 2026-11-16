import { Editor } from "./editor";

export default async function EditPage({ params }) {
  const { id } = await params;

  return (
    <main>
      <h1>Edit item {id}</h1>
      <Editor id={id} />
    </main>
  );
}
