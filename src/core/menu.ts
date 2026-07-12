import type {IconSequence} from 'bndr-js'

/**
 * Menu item data model, extracted from the legacy `src/Menu/Menu.vue` so the
 * actions store (and any menu-rendering component) can share it without
 * importing a framework component.
 */
interface BaseMenu {
	icon?: string
	label: string
	shortLabel?: string
	perform?: () => void
	children?: MenuItem[]
}

export interface MenuCommand extends BaseMenu {
	perform: () => void
	bindIcon?: IconSequence
}

export interface MenuGroup extends BaseMenu {
	children: MenuItem[]
}

/** A non-interactive divider between groups of items. */
export interface MenuSeparator {
	separator: true
}

export type MenuItem = MenuCommand | MenuGroup | MenuSeparator
