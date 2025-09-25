const API_BASE = process.env.REACT_APP_API_BASE || "";

// Enhanced API utility with better error handling
class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Generic fetch wrapper with error handling
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || "Request failed",
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      "Network error. Please check your connection.",
      0,
      error.message
    );
  }
}

export async function login(email, password) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchProducts(page = 1, limit = 10) {
  return apiRequest(`/products?page=${page}&limit=${limit}`);
}

export async function fetchProduct(id) {
  return apiRequest(`/products/${id}`);
}

export async function graphqlQuery(query, token) {
  return apiRequest("/graphql", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ query }),
  });
}

export { ApiError };
