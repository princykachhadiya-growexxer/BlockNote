import { authFetch } from "./browser-auth";

const BASE = "/api";

async function createApiError(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}));
  const error = new Error(data.message ?? fallbackMessage);
  error.status = res.status;
  return error;
}

// ─── Block API ────────────────────────────────────────────────────────────────

export async function fetchBlocks(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}/blocks`);
  if (!res.ok) throw await createApiError(res, "Failed to fetch blocks");
  const data = await res.json();
  return data.blocks;
}

export async function fetchUserBlocks({ starred = false } = {}) {
  const params = new URLSearchParams();
  if (starred) params.set("starred", "true");
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await authFetch(`${BASE}/blocks${suffix}`);
  if (!res.ok) throw await createApiError(res, "Failed to fetch blocks");
  const data = await res.json();
  return data.blocks;
}

export async function apiCreateBlock(docId, { type, content, order_index, parent_id = null }) {
  const res = await authFetch(`${BASE}/documents/${docId}/blocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content, order_index, parent_id }),
  });
  if (!res.ok) throw await createApiError(res, "Failed to create block");
  return (await res.json()).block;
}

export async function apiUpdateBlock(docId, blockId, fields, signal) {
  const res = await authFetch(`${BASE}/documents/${docId}/blocks/${blockId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
    signal,
  });
  if (!res.ok) throw await createApiError(res, "Failed to update block");
  return (await res.json()).block;
}

export async function apiDeleteBlock(docId, blockId) {
  const res = await authFetch(`${BASE}/documents/${docId}/blocks/${blockId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw await createApiError(res, "Failed to delete block");
}

export async function apiToggleBlockStar(blockId) {
  const res = await authFetch(`${BASE}/blocks/${blockId}/star`, {
    method: "PATCH",
  });
  if (!res.ok) throw await createApiError(res, "Failed to toggle block star");
  return res.json();
}

export async function apiSplitBlock(docId, blockId, { leftContent, rightContent, rightOrderIndex }) {
  const res = await authFetch(`${BASE}/documents/${docId}/blocks/${blockId}/split`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leftContent, rightContent, rightOrderIndex }),
  });
  if (!res.ok) throw await createApiError(res, "Failed to split block");
  return res.json(); // { left, right }
}

export async function apiReorderBlocks(docId, blocks) {
  const res = await authFetch(`${BASE}/documents/${docId}/blocks/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
  if (!res.ok) throw await createApiError(res, "Failed to reorder blocks");
  return res.json();
}

// ─── Document title ───────────────────────────────────────────────────────────

export async function apiUpdateDocTitle(docId, title, signal) {
  const res = await authFetch(`${BASE}/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
    signal,
  });
  if (!res.ok) throw await createApiError(res, "Failed to update title");
  return (await res.json()).document;
}

export async function apiFetchDoc(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}`);
  if (!res.ok) throw await createApiError(res, "Failed to fetch document");
  return (await res.json()).document;
}

export async function apiFetchDocuments({ starred = false, trashed = false } = {}) {
  const params = new URLSearchParams();
  if (starred) params.set("starred", "true");
  if (trashed) params.set("trashed", "true");
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await authFetch(`${BASE}/documents${suffix}`);
  if (!res.ok) throw await createApiError(res, "Failed to fetch documents");
  return (await res.json()).documents;
}

export async function apiFetchDashboardAnalytics() {
  const res = await authFetch(`${BASE}/documents/analytics`);
  if (!res.ok) throw await createApiError(res, "Failed to fetch dashboard analytics");
  return res.json();
}

export async function apiToggleDocumentStar(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}/star`, {
    method: "PATCH",
  });
  if (!res.ok) throw await createApiError(res, "Failed to toggle document star");
  return res.json();
}

export async function apiDeleteDocument(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw await createApiError(res, "Failed to delete document");
}

export async function apiRestoreDocument(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}/restore`, {
    method: "POST",
  });
  if (!res.ok) throw await createApiError(res, "Failed to restore document");
  return (await res.json()).document;
}

export async function apiPermanentlyDeleteDocument(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}/permanent`, {
    method: "DELETE",
  });
  if (!res.ok) throw await createApiError(res, "Failed to permanently delete document");
}

// ─── Share API ────────────────────────────────────────────────────────────────

export async function apiEnableShare(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "enable" }),
  });
  if (!res.ok) throw await createApiError(res, "Failed to enable sharing");
  return res.json(); // { shareToken, isPublic }
}

export async function apiRevokeShare(docId) {
  const res = await authFetch(`${BASE}/documents/${docId}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "revoke" }),
  });
  if (!res.ok) throw await createApiError(res, "Failed to revoke sharing");
  return res.json();
}

// ─── Public share read ────────────────────────────────────────────────────────

export async function fetchSharedDocument(token) {
  const res = await fetch(`${BASE}/share/${token}`);
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error("Failed to load shared document");
  return res.json(); // { document, blocks }
}
