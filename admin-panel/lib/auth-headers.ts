// Helper function to add auth headers to requests
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}
