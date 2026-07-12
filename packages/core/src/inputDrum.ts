export const DRUM_DRAG_STEP_PX = 40
export const DRUM_WHEEL_STEP_PX = 24

export function clampDrumIndex(index: number, optionCount: number): number {
	return Math.max(0, Math.min(optionCount - 1, index))
}

export function advanceDrumDragIndex(
	index: number,
	deltaX: number,
	optionCount: number,
	dragStepPx = DRUM_DRAG_STEP_PX
): number {
	return clampDrumIndex(index - deltaX / dragStepPx, optionCount)
}

export function getDrumClickOffset(
	x: number,
	viewportWidth: number,
	cellWidth: number
): number {
	return Math.round((x - viewportWidth / 2) / cellWidth)
}

export function consumeDrumWheel(
	accumulated: number,
	delta: number,
	threshold = DRUM_WHEEL_STEP_PX
): {steps: number; remainder: number} {
	const total = accumulated + delta
	const steps = Math.trunc(total / threshold)
	return {steps, remainder: total - steps * threshold}
}

export function findDrumTypeAheadIndex(
	labels: readonly string[],
	buffer: string
): number {
	const normalized = buffer.toLowerCase()
	return labels.findIndex(label => label.toLowerCase().startsWith(normalized))
}

export function getDrumCellWidth({
	cellWidth,
	measuredLabelWidth,
	viewportWidth,
	emPx,
	maxGapEm = 2,
}: {
	cellWidth?: number
	measuredLabelWidth: number
	viewportWidth: number
	emPx: number
	maxGapEm?: number
}): number {
	if (cellWidth) return Math.max(cellWidth, 1)
	if (!measuredLabelWidth || !viewportWidth) {
		return Math.max(measuredLabelWidth, 1)
	}
	let cells = Math.floor(viewportWidth / measuredLabelWidth)
	if (cells % 2 === 1) cells -= 1
	if (cells < 2) cells = 2
	return Math.min(viewportWidth / cells, measuredLabelWidth + maxGapEm * emPx)
}
