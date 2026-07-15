import {type HTMLAttributes} from 'react'

export type TooltipProps = HTMLAttributes<HTMLDivElement>

export function Tooltip({className, ...props}: TooltipProps) {
	return <div {...props} className={className} data-tq-component="tooltip" />
}
