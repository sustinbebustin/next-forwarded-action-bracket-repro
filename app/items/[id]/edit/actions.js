"use server";

import { writeDraft } from "../../../store";

export async function saveDraft(id, text) {
  writeDraft(id, text);

  return { saved: true };
}
