import {Badge, Box, Button, Flex, Image, Text} from '@chakra-ui/react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {useEffect, useId, useMemo, useRef, useState} from 'react'
import type {Swiper as SwiperType} from 'swiper'
import {Navigation} from 'swiper/modules'
import {Swiper, SwiperSlide} from 'swiper/react'
import {ImagePlaceholder} from '@/components'
import {useComposition} from '@/store'

import 'swiper/css'
import 'swiper/css/navigation'

export const StepImageSlider = () => {
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const lastChangedStepName = useComposition(
		(state) => state.lastChangedStepName,
	)
	const id = useId()
	const swiperRef = useRef<SwiperType | null>(null)

	const [isBeginning, setIsBeginning] = useState(true)
	const [isEnd, setIsEnd] = useState(false)

	// Собираем все изображения из выбранных продуктов
	const images = useMemo(
		() =>
			Object.entries(selectedProducts).flatMap(([stepName, stepData]) => {
				if (Array.isArray(stepData) || !stepData.products.length) {
					return []
				}

				return stepData.products
					.map((product) => ({
						stepName,
						image: product.image,
						article: product.article,
					}))
					.filter((item) => item.image)
			}),
		[selectedProducts],
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

			// Обновляем состояние кнопок после программного свайпа
			setIsBeginning(swiperRef.current.isBeginning)
			setIsEnd(swiperRef.current.isEnd)
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
				modules={[Navigation]}
				slidesPerView={1}
				grabCursor
				observer
				observeParents
				watchOverflow
				onSwiper={(swiper) => {
					swiperRef.current = swiper
				}}
				onSlideChange={(swiper) => {
					setIsBeginning(swiper.isBeginning)
					setIsEnd(swiper.isEnd)
				}}
				style={{width: '100%', height: '100%'}}
			>
				{images.map((item, idx) => (
					<SwiperSlide key={`${id}-${item.article}-${idx}`}>
						<Box w="full" h="full">
							{item.image && (
								<Image
									w="full"
									h="full"
									fit="cover"
									src={item.image}
									alt={item.stepName}
									loading="lazy"
									objectFit="cover"
								/>
							)}

							<Badge
								pos="absolute"
								top="0"
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
			{images.length <= 1 ? null : (
				<Flex
					w="full"
					position="absolute"
					justify="space-between"
					bottom="0"
					left="0"
					zIndex="1"
				>
					<Button
						type="button"
						borderRadius="none"
						aspectRatio="1"
						size="xs"
						onClick={() => swiperRef.current?.slidePrev()}
						disabled={isBeginning}
					>
						<ChevronLeft />
					</Button>
					<Button
						type="button"
						borderRadius="none"
						aspectRatio="1"
						size="xs"
						onClick={() => swiperRef.current?.slideNext()}
						disabled={isEnd}
					>
						<ChevronRight />
					</Button>
				</Flex>
			)}
		</Box>
	)
}
