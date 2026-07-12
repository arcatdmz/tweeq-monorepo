/**
 * The renderer harness interface (plan §3.1, `@tweeq/test-contracts`).
 *
 * Each renderer package implements this once; every conformance suite is
 * parameterized over it so the same behavioral contract runs against React
 * and Vue. Suites live next to the component families they cover and are
 * added as families migrate (Phase 4).
 */

export interface PointerAction {
	type: 'down' | 'move' | 'up' | 'wheel'
	/** Position relative to the mounted root. */
	x: number
	y: number
	button?: number
	deltaY?: number
	shiftKey?: boolean
	altKey?: boolean
	ctrlKey?: boolean
	metaKey?: boolean
}

export interface KeyAction {
	type: 'down' | 'up' | 'press'
	key: string
	shiftKey?: boolean
	altKey?: boolean
	ctrlKey?: boolean
	metaKey?: boolean
}

/** An event emitted through the component's public API during the test. */
export interface HarnessEvent {
	name: string
	payload: unknown[]
}

export interface RendererHarness<Props = Record<string, unknown>> {
	/** Re-render with new props (controlled `value` / `modelValue` included). */
	update(props: Partial<Props>): Promise<void>
	/** Query a stable style part (`[data-tq-part=…]` or `.tq-*` class). */
	part(name: string): Element | null
	/** Dispatch a pointer interaction onto a part (or the root). */
	pointer(action: PointerAction, part?: string): Promise<void>
	/** Dispatch a keyboard interaction onto a part (or the focused element). */
	key(action: KeyAction, part?: string): Promise<void>
	/** Invoke the element's native activation behavior (normally `click()`). */
	activate(part?: string): Promise<void>
	/** Replace text and dispatch the renderer's native input event. */
	text?(value: string, part?: string): Promise<void>
	/** The component's current public value, as reported to the consumer. */
	value(): unknown
	/** Events captured since mount, in emission order. */
	events(): readonly HarnessEvent[]
	unmount(): void
}

export type RendererHarnessFactory<Props = Record<string, unknown>> = (
	component: string,
	initialProps: Props,
) => Promise<RendererHarness<Props>>
