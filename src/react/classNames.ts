export function classNames(
	...values: (string | false | null | undefined)[]
): string {
	return values.filter(Boolean).join(' ')
}
