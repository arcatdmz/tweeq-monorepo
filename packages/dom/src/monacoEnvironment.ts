export type MonacoWorkerFactory = (moduleId: string, label: string) => Worker

interface MonacoEnvironment {
	getWorker?: MonacoWorkerFactory
	getWorkerUrl?: (moduleId: string, label: string) => string
}

/**
 * Install a default Monaco worker factory only when the host has not supplied
 * either supported worker hook. Callers own when this browser-global adapter
 * is activated; importing @tweeq/dom remains side-effect-free.
 */
export function ensureMonacoEnvironment(
	getWorker: MonacoWorkerFactory,
): boolean {
	const host = globalThis as typeof globalThis & {
		MonacoEnvironment?: MonacoEnvironment
	}
	const current = host.MonacoEnvironment
	if (
		typeof current?.getWorker === 'function' ||
		typeof current?.getWorkerUrl === 'function'
	) {
		return false
	}
	host.MonacoEnvironment = {...current, getWorker}
	return true
}
