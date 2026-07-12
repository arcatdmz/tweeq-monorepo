// Stage V2: the implementations live in @tweeq/core (pure) and @tweeq/dom
// (browser); this module keeps the original '../util' import paths and the
// public `export * from './util'` surface working unchanged.
export {
	getNumberPresition,
	precisionOf,
	toFixed,
	toPercent,
	unsignedMod,
} from '@tweeq/core'
export {addAnchorName, isDecendantElementOf, nodeContains} from '@tweeq/dom'
