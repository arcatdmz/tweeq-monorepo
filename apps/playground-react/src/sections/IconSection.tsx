import {Icon} from '@tweeq/react'

const STAR_PATH =
	'M12 2.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.67l-5.84 3.08 1.11-6.5-4.72-4.6 6.53-.95L12 2.5z'

export default function IconSection() {
	return (
		<section data-testid="Icon">
			<h2>Icon</h2>
			<Icon icon="char:★" />
			<Icon data-testid="iconify-icon" icon="material-symbols:diamond" />
			<Icon data-testid="fill-icon" icon={`fill:${STAR_PATH}`} />
			<Icon data-testid="char-icon" icon="char:⌘" />
		</section>
	)
}
