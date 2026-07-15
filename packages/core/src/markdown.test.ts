import {describe, expect, it} from 'vitest'

import {renderMarkdown} from './markdown'

describe('markdown renderer', () => {
	it('renders the shared plugin pipeline synchronously', () => {
		const html = renderMarkdown('# Title\n\nTerm\n: Definition\n\n[^1]\n\n[^1]: Note')
		expect(html).toContain('<h1 id="title" tabindex="-1">Title</h1>')
		expect(html).toContain('<dl>')
		expect(html).toContain('class="footnotes"')
	})

	it('keeps raw HTML disabled by default', () => {
		expect(renderMarkdown('<script>bad()</script>')).toContain(
			'&lt;script&gt;bad()&lt;/script&gt;'
		)
	})
})
