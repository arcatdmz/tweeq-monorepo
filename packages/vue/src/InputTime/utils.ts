import {defineStore} from 'pinia'

import {useAppConfigStore} from '../stores/appConfig'
import {TimeFormat} from './types'

export const useInputTimeContext = defineStore('tq.inputTime', () => {
	// Persisted app-wide so the choice survives reloads. Defaults to plain frame
	// numbers; toggle to SMPTE timecode from the input itself.
	const config = useAppConfigStore().group('inputTime')
	const format = config.ref<TimeFormat>('format', 'frames')

	return {format}
})

// Stage V2: the timecode implementations live in @tweeq/core. Note one
// converged behavior: legacy replaceTimecodeWithFrames parsed comma
// timecodes inside expressions at a hardcoded 24 fps; the shared version
// uses the actual frameRate (covered by core's inputTime fixtures).
export {
	formatTimecode,
	parseTimecode,
	replaceTimecodeWithFrames,
} from '@tweeq/core'
