const TOKEN_KEY = 'mf_token';
const USERS_API = '/api/v1/users';
const PRODUCTS_API = '/api/v1/products';
const ORDERS_API = '/api/v1/orders';

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Erro ${res.status}`);
  return json;
}

/* ═══════════════════════════════════
   DASHBOARD STATS
═══════════════════════════════════ */
export async function fetchAdminStats() {
  const res = await fetch(`${USERS_API}/admin/stats`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data.data;
}

/* ═══════════════════════════════════
   UTILIZADORES
═══════════════════════════════════ */
export async function fetchAllUsers() {
  const res = await fetch(`${USERS_API}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data.data;
}

export async function updateUser(id, body) {
  const res = await fetch(`${USERS_API}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = await handleResponse(res);
  return json.data.data;
}

export async function deleteUser(id) {
  const res = await fetch(`${USERS_API}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  });
  if (res.status !== 204 && !res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Erro ao eliminar utilizador');
  }
}

/* ═══════════════════════════════════
   PRODUTOS
═══════════════════════════════════ */
export async function fetchAllProductsAdmin() {
  const res = await fetch(`${PRODUCTS_API}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data.data;
}

export async function updateProduct(id, body) {
  const res = await fetch(`${PRODUCTS_API}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = await handleResponse(res);
  return json.data.data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${PRODUCTS_API}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  });
  if (res.status !== 204 && !res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Erro ao eliminar produto');
  }
}

export async function createProduct(formData) {
  const token = localStorage.getItem(TOKEN_KEY);
  // Sem Content-Type — o browser define automaticamente o boundary do multipart
  const res = await fetch(`${PRODUCTS_API}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
    body: formData,
  });
  const json = await handleResponse(res);
  return json.data.data;
}

export async function fetchFieldOptions() {
  const res = await fetch(`${PRODUCTS_API}/field-options`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data.options;
}

/* ═══════════════════════════════════
   ENCOMENDAS
═══════════════════════════════════ */
export async function fetchAllOrders() {
  const res = await fetch(`${ORDERS_API}?sort=-createdAt&limit=100`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  const json = await handleResponse(res);
  return json.data.data;
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${ORDERS_API}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  const json = await handleResponse(res);
  return json.data.data;
}
