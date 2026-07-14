export interface IconIndicatorProps {
	active?: boolean
	icon: string
	/**
	 * Size the indicator to the nested icon size (--tq-icon-size) instead of a
	 * full input slot, for placing it inline alongside text (e.g. before a label).
	 */
	inline?: boolean
	/** Disable this indicator's own button behavior when nested in another widget. */
	interactive?: boolean
}
