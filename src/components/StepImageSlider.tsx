import {Badge, Box, Flex, Image, Text} from '@chakra-ui/react'
import {useEffect, useId, useRef} from 'react'
import type {Swiper as SwiperType} from 'swiper'
import {Swiper, SwiperSlide} from 'swiper/react'
import {ImagePlaceholder} from '@/components'
import {useComposition} from '@/store'

import 'swiper/css'

export const StepImageSlider = () => {
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const lastChangedStepName = useComposition(
		(state) => state.lastChangedStepName,
	)
	const id = useId()
	const swiperRef = useRef<SwiperType | null>(null)

	// Собираем все изображения из выбранных продуктов
	const images = Object.entries(selectedProducts).flatMap(
		([stepName, stepData]) => {
			if (Array.isArray(stepData) || !stepData.products.length) return []
			return stepData.products
				.map((product) => ({
					stepName,
					image: product.image,
					article: product.article,
				}))
				.filter((item) => item.image)
		},
	)

	// Свайпаем на последний слайд при изменении images
	useEffect(() => {
		if (!swiperRef.current || !lastChangedStepName || images.length === 0)
			return

		const targetIndex = images.findIndex(
			(item) => item.stepName === lastChangedStepName,
		)

		if (targetIndex !== -1) {
			swiperRef.current.slideTo(targetIndex)
		}
	}, [lastChangedStepName, images])

	if (!images.length) {
		return (
			<Flex
				align="center"
				justify="center"
				w="full"
				h="full"
				direction="column"
				gap="5"
				backgroundColor="gray.100"
			>
				<Box display={{base: 'none', md: 'block'}} w="25%" aspectRatio="1">
					<ImagePlaceholder color="#d4d4d8" />
				</Box>
				<Text
					textAlign="center"
					textWrap="balance"
					color="gray.400"
					lineHeight="1.3"
					w={{base: '90%', md: '70%'}}
					fontSize={{base: 'clamp(8px, 2vw, 14px)', lg: 'sm'}}
				>
					Покажем здесь картинку детали
				</Text>
			</Flex>
		)
	}

	return (
		<Box
			w="full"
			h="full"
			position="relative"
			border="1px solid"
			borderColor="gray.300"
		>
			<Swiper
				slidesPerView={1}
				grabCursor
				observer
				observeParents
				watchOverflow
				onSwiper={(swiper) => {
					swiperRef.current = swiper
				}}
				pagination={{
					clickable: true,
				}}
				style={{width: '100%', height: '100%'}}
			>
				{images.map((item, idx) => (
					<SwiperSlide key={`${id}-${item.article}-${idx}`}>
						<Box w="full" h="full">
							<Image
								w="full"
								h="full"
								fit="cover"
								src={item.image}
								alt={item.stepName}
								loading="lazy"
								objectFit="cover"
							/>
							<Badge
								pos="absolute"
								bottom="0"
								right="0"
								borderRadius="0"
								size="md"
								variant="solid"
								colorPalette="black"
								fontSize="2xs"
							>
								{item.stepName}
							</Badge>
						</Box>
					</SwiperSlide>
				))}
			</Swiper>
		</Box>
	)
}
