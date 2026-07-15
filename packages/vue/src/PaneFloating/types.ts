export type {FloatingPanePosition as Position, PaneDimension} from '@tweeq/core'

import type {FloatingPanePosition} from '@tweeq/core'

export interface PaneFloatingProps {
	name: string
	icon?: string
	position?: FloatingPanePosition
}
