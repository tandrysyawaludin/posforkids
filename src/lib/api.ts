const BASE_PATH = "/vercel-agent";

export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(`${BASE_PATH}${path}`, options);
}

export { BASE_PATH };
