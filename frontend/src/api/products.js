const API = '/api/v1/products';

export async function fetchAllProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API}?${query}` : API;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao carregar produtos');
  const json = await res.json();
  return json.data.data;
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(`${API}?slug=${slug}`);
  if (!res.ok) throw new Error('Produto não encontrado');
  const json = await res.json();
  return json.data.data[0] || null;
}

export async function fetchProductById(id) {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error('Produto não encontrado');
  const json = await res.json();
  return json.data.data;
}

export async function fetchFieldOptions() {
  const res = await fetch(`${API}/field-options`);
  if (!res.ok) throw new Error('Erro ao carregar opções');
  const json = await res.json();
  return json.data;
}

/**
 * Groups a flat product array by category → subcategory.
 * Returns: { "Roupa de Cama": { "Capas de Edredão": [...], ... }, ... }
 */
export function groupByCategoryAndSub(products) {
  const grouped = {};
  products.forEach((p) => {
    const cat = p.category || 'Outros';
    const sub = p.subcategory || 'Geral';
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][sub]) grouped[cat][sub] = [];
    grouped[cat][sub].push(p);
  });
  return grouped;
}
