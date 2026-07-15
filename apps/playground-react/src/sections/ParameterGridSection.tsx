import {
	InputString,
	Parameter,
	ParameterGrid,
	ParameterGroup,
	ParameterHeading,
} from '@tweeq/react'

export default function ParameterGridSection() {
	return (
		<section data-testid="ParameterGrid">
			<h2>ParameterGrid family</h2>
			<ParameterGrid>
				<ParameterHeading right="Ready">Parameters</ParameterHeading>
				<Parameter label="Name" hint="A controlled name">
					<InputString value="Tweeq" />
				</Parameter>
				<ParameterGroup name="demo-advanced" label="Advanced">
					<Parameter label="Mode">
						<InputString value="Detailed" />
					</Parameter>
				</ParameterGroup>
			</ParameterGrid>
		</section>
	)
}
