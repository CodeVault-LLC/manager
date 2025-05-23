import { FC } from 'react'
import 'keen-slider/keen-slider.min.css'
import { Msn } from '@renderer/components/brands/msn'
import { Badge } from '@renderer/components/ui/badge'
import { useApplicationStore } from '@renderer/core/store/application.store'
import { useDashboardStore } from '@renderer/core/store/dashboard.store'
import { useKeenSlider } from 'keen-slider/react'

export const News: FC = () => {
  const { news } = useDashboardStore()
  const { openExternalLink } = useApplicationStore()

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 16
    },
    mode: 'snap',
    loop: true
  })

  return (
    <div className="p-4 shadow-md">
      <div ref={sliderRef} className="keen-slider">
        {news.map((item, index) => (
          <div key={item.id} className="keen-slider__slide">
            <div className="flex rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 w-full h-[140px]">
              {/* Left Side: Image */}
              <div className="w-[180px] h-full">
                <img
                  src={`${item.thumbnail.url}?h=140&w=180`}
                  loading={index > 3 ? 'lazy' : 'eager'}
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
                    className="text-sm font-medium dark:text-blue-500 text-blue-600 cursor-pointer"
                    onClick={() => {
                      openExternalLink(item.homepageUrl)
                    }}
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
                    {new Date(item.publishedDate).toLocaleDateString() +
                      ' ' +
                      new Date(item.publishedDate).toLocaleTimeString()}
                  </span>

                  <Badge variant={'outline'} className="text-xs">
                    {item.category.slice(0, 1).toUpperCase() +
                      item.category.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <a
          onClick={() => openExternalLink('https://www.msn.com')}
          className="cursor-pointer"
        >
          <Msn />
        </a>
      </div>
    </div>
  )
}
