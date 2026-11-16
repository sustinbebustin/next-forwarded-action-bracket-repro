// One in-memory store for the whole server process, whichever route bundle
// loads this module.
const drafts = (globalThis.__drafts ??= new Map());

export function readDraft(id) {
  return drafts.get(id) ?? null;
}

export function writeDraft(id, text) {
  drafts.set(id, text);
}
