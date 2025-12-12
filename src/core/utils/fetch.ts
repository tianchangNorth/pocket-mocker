export function $fetch(url: string, method: string, options?: RequestInit) {
  fetch(url, { method, ...options })
}