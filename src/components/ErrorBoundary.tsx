import {Heading} from '@chakra-ui/react'
import React from 'react'

interface Props {
	children: React.ReactNode
}

interface ErrorState {
	hasError: boolean
	error?: Error
	errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<Props, ErrorState> {
	constructor(props: Props) {
		super(props)
		this.state = {hasError: false}
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({hasError: true, error, errorInfo})
	}

	render() {
		const {hasError, error, errorInfo} = this.state

		if (hasError) {
			console.error(error?.toString(), errorInfo?.componentStack)

			return <Heading>Ошибка! Что-то пошло не так.</Heading>
		}

		return this.props.children
	}
}
