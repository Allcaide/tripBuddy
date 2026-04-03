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

/**
 * Groups products that are variants of the same base product.
 * Detection: name split on " — " (e.g. "Capa de Linho — King" → base "Capa de Linho", label "King").
 * Products without " — " become single-variant groups.
 *
 * Each group:
 *   baseName   — display name
 *   variants   — array of products sorted cheapest first, each with variantLabel
 *   allColors  — union of colors across all variants
 *   minPrice   — lowest price in group
 *   maxPrice   — highest price in group
 */
export function groupProductVariants(products) {
  const map = new Map();

  for (const product of products) {
    const sep = product.name.lastIndexOf(' — ');
    const namePart = sep !== -1 ? product.name.slice(0, sep).trim() : product.name;
    const variantLabel = sep !== -1 ? product.name.slice(sep + 3).trim() : null;

    // Use productGroup (from DB) as key when available — ensures verde + linho
    // share one card even though their names differ.
    const key = product.productGroup || namePart;

    if (!map.has(key)) {
      map.set(key, { baseName: namePart, variants: [] });
    } else {
      // Keep the shortest namePart as baseName (e.g. "Capa de Edredão em Linho"
      // is preferred over "Capa de Edredão em Linho Verde")
      const entry = map.get(key);
      if (namePart.length < entry.baseName.length) entry.baseName = namePart;
    }
    map.get(key).variants.push({ ...product, variantLabel });
  }

  return Array.from(map.values()).map((group) => {
    const variants = [...group.variants].sort((a, b) => a.price - b.price);
    const allColors = [...new Set(variants.flatMap((v) => v.colors || []))];
    const prices = variants.map((v) => v.price);
    return {
      baseName: group.baseName,
      variants,
      allColors,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  });
}
