import {List, Text} from '@chakra-ui/react'

export const PropList = () => {
	return (
		<List.Root variant="plain" {...listStyle}>
			{[1, 2, 3].map((i) => (
				<List.Item key={i} {...itemStyle}>
					<Text p="3">Property</Text>
					<Text p="3">Value</Text>
				</List.Item>
			))}
		</List.Root>
	)
}

// #region Styles
const listStyle = {
	w: 'full',
	fontWeight: 'normal',
	fontSize: 'sm',
	lineHeight: '20px',
	letterSpacing: '0',
}

const itemStyle = {
	justifyContent: 'space-between',
	borderBottomWidth: '1px',
	borderBottomColor: 'gray.200',
}
// #endregion
