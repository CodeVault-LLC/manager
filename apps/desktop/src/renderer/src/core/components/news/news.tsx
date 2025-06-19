import 'keen-slider/keen-slider.min.css'
import { Msn } from '@renderer/components/brands/msn'
import { useApplicationStore } from '@renderer/core/store/application.store'
import { useDashboardStore } from '@renderer/core/store/dashboard.store'
import { useKeenSlider } from 'keen-slider/react'
import { FC, useEffect } from 'react'
import { Badge } from '@manager/ui'
import { Skeleton } from '@manager/ui/src/ui/skeleton'

export const News: FC = () => {
  const { news, fetchNews } = useDashboardStore()
  const { openExternalLink } = useApplicationStore()

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 2,
      spacing: 16
    },
    mode: 'snap',
    loop: true
  })

  useEffect(() => {
    void fetchNews()
  }, [])

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update()
    }
  }, [news.length])

  const isLoading = news.length === 0

  return (
    <div className="p-4 shadow-md">
      <div ref={!isLoading ? sliderRef : undefined} className="keen-slider">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="keen-slider__slide">
                <div className="flex rounded-xl shadow-sm overflow-hidden w-full h-[140px] animate-pulse">
                  <div className="w-[180px] h-full">
                    <Skeleton className="w-full h-full" />
                  </div>

                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          : news.map((item, index) => (
              <div key={item.id} className="keen-slider__slide">
                <div className="flex rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 w-full h-[140px]">
                  <div className="w-[180px] h-full">
                    <img
                      src={`${item.thumbnail.url}?h=300&w=180`}
                      loading={index > 3 ? 'lazy' : 'eager'}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex flex-col flex-1 p-4 overflow-hidden justify-between">
                    <div className="flex items-center">
                      <img
                        src={`${item.provider.brandLogoUrl}?h=24&w=24`}
                        alt={item.provider.brandName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
                        {item.provider.brandName}
                      </span>
                    </div>

                    <div className="flex flex-col overflow-hidden">
                      <a
                        className="text-sm font-medium dark:text-blue-500 text-blue-600 cursor-pointer"
                        onClick={() => openExternalLink(item.homepageUrl)}
                      >
                        <h3 className="text-base font-semibold leading-tight">
                          {item.title}
                        </h3>
                      </a>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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

      <div className="flex justify-end mt-2">
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
