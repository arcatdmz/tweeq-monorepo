export const DRUM_DRAG_STEP_PX = 40

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
