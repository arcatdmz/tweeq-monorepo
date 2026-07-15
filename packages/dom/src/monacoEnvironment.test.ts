import {afterEach, describe, expect, it} from 'vitest'

import {ensureMonacoEnvironment} from './monacoEnvironment'

const host = globalThis as typeof globalThis & {
	MonacoEnvironment?: Record<string, unknown>
}
const original = host.MonacoEnvironment

afterEach(() => {
	if (original === undefined) delete host.MonacoEnvironment
	else host.MonacoEnvironment = original
})

describe('ensureMonacoEnvironment', () => {
	it('installs an explicit worker factory', () => {
		delete host.MonacoEnvironment
		const factory = () => ({}) as Worker

		expect(ensureMonacoEnvironment(factory)).toBe(true)
		expect(host.MonacoEnvironment?.getWorker).toBe(factory)
	})

	it('preserves consumer getWorker and getWorkerUrl hooks', () => {
		const getWorker = () => ({}) as Worker
		host.MonacoEnvironment = {getWorker}
		expect(ensureMonacoEnvironment(() => ({}) as Worker)).toBe(false)
		expect(host.MonacoEnvironment.getWorker).toBe(getWorker)

		const getWorkerUrl = () => '/custom-worker.js'
		host.MonacoEnvironment = {getWorkerUrl}
		expect(ensureMonacoEnvironment(() => ({}) as Worker)).toBe(false)
		expect(host.MonacoEnvironment.getWorkerUrl).toBe(getWorkerUrl)
	})
})
