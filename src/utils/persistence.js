/****************
 * Persistence   *
 ****************/
const STORAGE_KEY = "divi_like_doc_v1";

export const saveDoc = (doc) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));

export const loadDoc = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};
