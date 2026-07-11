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

export interface Point {
	x: number
	y: number
}

/** Inclusive point-in-triangle test used by Menu's safe submenu corridor. */
export function isPointInTriangle(
	point: Point,
	a: Point,
	b: Point,
	c: Point
): boolean {
	const cross = (p1: Point, p2: Point, p3: Point) =>
		(p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
	const d1 = cross(point, a, b)
	const d2 = cross(point, b, c)
	const d3 = cross(point, c, a)
	const negative = d1 < 0 || d2 < 0 || d3 < 0
	const positive = d1 > 0 || d2 > 0 || d3 > 0
	return !(negative && positive)
}
