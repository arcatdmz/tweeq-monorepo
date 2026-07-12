/** Resolve a public demo asset under Vite's configured deployment base. */
export function assetPath(path: string): string {
	return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
