import type {TimeFormat} from '@tweeq/core'

import {appConfigStore} from './stores/appConfig'

/**
 * Persisted display format for InputTime. Lives here rather than in core
 * because it binds the pure `TimeFormat` type to the browser-backed
 * appConfig store (architecture rule 1/4).
 */
export const inputTimeFormatEntry = appConfigStore
	.getState()
	.group('inputTime')
	.ref<TimeFormat>('format', 'frames')
