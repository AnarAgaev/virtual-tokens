import {Tooltip as ChakraTooltip, Portal} from '@chakra-ui/react'
import * as React from 'react'

export interface TooltipProps extends ChakraTooltip.RootProps {
	showArrow?: boolean
	portalled?: boolean
	portalRef?: React.RefObject<HTMLElement | null>
	content: React.ReactNode
	contentProps?: ChakraTooltip.ContentProps
	disabled?: boolean
	textAlign?: 'left' | 'center' | 'right'
}

const tooltipFontOverride: React.CSSProperties = {
	fontFamily: 'var(--chakra-fonts-body)',
	fontSize: 'var(--chakra-font-sizes-xs)',
	lineHeight: 'var(--chakra-line-heights-shorter)',
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
	function Tooltip(props, ref) {
		const {
			showArrow,
			children,
			disabled,
			portalled = true,
			content,
			contentProps,
			portalRef,
			textAlign,
			...rest
		} = props

		if (disabled) return children

		return (
			<ChakraTooltip.Root {...rest}>
				<ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
				<Portal disabled={!portalled} container={portalRef}>
					<ChakraTooltip.Positioner>
						<ChakraTooltip.Content
							ref={ref}
							{...contentProps}
							borderRadius={0}
							p="3"
							maxW="260px"
							textWrap="balance"
							textAlign={!textAlign ? 'left' : textAlign}
							style={tooltipFontOverride}
						>
							{showArrow && (
								<ChakraTooltip.Arrow>
									<ChakraTooltip.ArrowTip />
								</ChakraTooltip.Arrow>
							)}
							{content}
						</ChakraTooltip.Content>
					</ChakraTooltip.Positioner>
				</Portal>
			</ChakraTooltip.Root>
		)
	},
)
