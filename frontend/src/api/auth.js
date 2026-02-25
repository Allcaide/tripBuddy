const API = '/api/v1/users';

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Credenciais inválidas');
  return json;
}

export async function signup({ name, email, password, passwordConfirm }) {
  const res = await fetch(`${API}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, passwordConfirm }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erro ao criar conta');
  return json;
}

export async function logout() {
  const res = await fetch(`${API}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erro ao terminar sessão');
  return json;
}

export async function getMe(token) {
  const res = await fetch(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data.data;
}

export async function forgotPassword(email) {
  const res = await fetch(`${API}/forgotPassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erro ao enviar email');
  return json;
}

export async function updateMe(token, formData) {
  const res = await fetch(`${API}/updateMe`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: formData, // FormData (supports photo upload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erro ao atualizar perfil');
  return json.data.data;
}
