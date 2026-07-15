import {Tab, Tabs} from '@tweeq/react'

export default function TabsSection() {
	return (
		<section data-testid="Tabs">
			<h2>Tabs / Tab</h2>
			<Tabs name="demo-tabs">
				<Tab name="First">First panel</Tab>
				<Tab name="Second">Second panel</Tab>
			</Tabs>
		</section>
	)
}
