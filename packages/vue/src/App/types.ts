import type {TweeqOptions} from '../useTweeq'

export interface AppProps extends TweeqOptions {
	appId?: string
	withProvider?: boolean
	embedded?: boolean
}
