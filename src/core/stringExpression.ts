export interface StringExpressionContext {
	i: number
}

export type StringExpression = (
	value: string,
	context: StringExpressionContext
) => string

/** Compile InputString's expression mode with its legacy coercion semantics. */
export function compileStringExpression(expression: string): StringExpression {
	const evaluate = new Function(
		'x',
		'context',
		`const {i} = context;
		const result = (${expression});
		if (typeof result === 'string') return result;
		if (typeof result === 'number') return result.toString();
		throw new Error('Value is not a string or number');`
	) as StringExpression

	return evaluate
}
