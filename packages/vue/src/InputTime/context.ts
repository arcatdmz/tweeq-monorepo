import {reactive} from 'vue'

import {useAppConfigStore} from '../stores/appConfig'
import type {TimeFormat} from './types'

const config = useAppConfigStore().group('inputTime')
const context = reactive({
	format: config.ref<TimeFormat>('format', 'frames'),
})

/** App-wide persisted InputTime display preference without a Pinia store. */
export function useInputTimeContext() {
	return context
}
