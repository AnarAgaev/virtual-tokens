import {Link, List, Text, VisuallyHidden} from '@chakra-ui/react'
import {useId, useMemo} from 'react'
import {useComposition, useConfiguration} from '@/store'
import type {T_CompositionSlice} from '@/types'
import type {T_StepsCount, T_Titles} from '@/zod'

const getTotalProductList = (
	reactId: string,
	selectedProducts: T_CompositionSlice['selectedProducts'],
	titles: T_Titles,
	stepCount: T_StepsCount,
) => {
	const elementList = []

	Object.entries(selectedProducts).forEach(([stepName, selectedData]) => {
		if (Array.isArray(selectedData)) return

		selectedData.products.forEach((product) => {
			const multipleCount = stepCount?.[stepName]
			const title =
				(product.article && titles?.[product.article]) ?? product.title

			elementList.push(
				<List.Item key={`${reactId}-${product.article}`} {...itemStyle}>
					<Link
						textWrap="nowrap"
						flexShrink="0"
						href={product.link}
						target="_blank"
						data-cy="article"
						p="3"
					>
						{product.article}
					</Link>
					<Text p="3" textAlign="right">
						{/* Наименование */}
						{`${title} `}

						{/* Стоимость */}
						{/* <VisuallyHidden
							as="span"
							textWrap="nowrap"
						>{`(${product.price?.toLocaleString('ru-RU')} р.)`}</VisuallyHidden> */}
						<Text
							as="span"
							textWrap="nowrap"
						>{`(${product.price?.toLocaleString('ru-RU')} р.)`}</Text>

						{/* Количество  */}
						{multipleCount && multipleCount > 1 ? (
							<Text
								as="span"
								textWrap="nowrap"
								data-cy="doubleValue"
								fontWeight="bold"
							>{` - ${multipleCount} шт.`}</Text>
						) : null}
					</Text>
				</List.Item>,
			)
		})
	})

	// Заглушка до того, как начал выбирать конфигурацию
	if (!elementList.length) {
		elementList.push(
			<List.Item key={reactId} {...itemStyle} borderBottom="none">
				<Text
					textAlign={{lg: 'right'}}
					textWrap="balance"
					w="full"
					maxW={{'2xl': '50%'}}
					ml="auto"
				>
					Покажем здесь состав комплекта, как только начнете выбирать на вкладке
					<Text as="span" fontWeight="bold">
						&nbsp;Конфигуратор
					</Text>
				</Text>
			</List.Item>,
		)
	}

	return elementList
}

export const TotalProducts = () => {
	const reactId = useId()
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const titles = useConfiguration((store) => store.titles)
	const stepCount = useConfiguration((store) => store.stepsCount)

	const totalProductList = useMemo(
		() => getTotalProductList(reactId, selectedProducts, titles, stepCount),
		[reactId, selectedProducts, titles, stepCount],
	)

	return (
		<List.Root variant="plain" {...listStyle}>
			{totalProductList}
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
