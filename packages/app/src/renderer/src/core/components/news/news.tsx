import { FC } from 'react'
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { observer } from 'mobx-react'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useDashboard } from '@renderer/hooks/use-dashboard'
import { Badge } from '@renderer/components/ui/badge'

export const News: FC = observer(() => {
  const { t } = useI18n()
  const { news } = useDashboard()

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 2,
      spacing: 16
    },
    mode: 'free-snap'
  })

  return (
    <div ref={sliderRef} className="keen-slider">
      {news.map((item) => (
        <div key={item.id} className="keen-slider__slide">
          <div className="flex rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 w-[480px] h-[140px]">
            {/* Left Side: Image */}
            <div className="w-[180px] h-full">
              <img
                src={`${item.thumbnail.url}?h=140&w=180`}
                alt={item.title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Right Side: Texts */}
            <div className="flex flex-col flex-1 p-4 overflow-hidden justify-between gap-1">
              <div className="flex items-center">
                <img
                  src={`${item.provider.brandLogoUrl}?h=24&w=24`}
                  alt={item.provider.brandName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="ml-2 text-xs text-gray-600 font-medium truncate">
                  {item.provider.brandName}
                </span>
              </div>

              <div>
                <a
                  href="#"
                  className="text-sm font-medium dark:text-blue-500 text-blue-600"
                >
                  <h3 className="text-base font-semibold leading-tight truncate">
                    {item.title}
                  </h3>
                </a>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(item.publishedDate).toLocaleDateString()}
                </span>

                <Badge variant={'outline'} className="text-xs">
                  {t('news.category.' + item.category)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})
