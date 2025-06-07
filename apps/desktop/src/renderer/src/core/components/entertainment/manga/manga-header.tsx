import { FC } from 'react'

import { Badge } from '@manager/ui'

export const MangaHeader: FC = () => {
  return (
    <div className="h-full relative flex flex-row gap-4">
      <a
        href="/title/c331a246-99d6-4b38-8a63-0267496545ae/a-story-about-making-a-wish-to-the-genie-of-the-lamp"
        className="group flex items-start relative mb-auto select-none !h-[10rem] md:!h-full aspect-[7/10] !w-auto object-top object-cover rounded sm:shadow-lg bg-transparent"
      >
        <img
          className="rounded shadow-md w-full h-full"
          src="https://mangadex.org/covers/c331a246-99d6-4b38-8a63-0267496545ae/782fe90b-4baf-4d77-b74e-284301e773fe.jpg.512.jpg"
          alt="Cover image"
        />
        <img
          className="inline-block select-none absolute right-2 bottom-1.5"
          title="Japanese"
          src="/img/flags/jp.svg"
          alt="Japanese flag icon"
          width="24"
          height="24"
          style={{ zIndex: 1 }}
        />
      </a>

      <div
        className="mt-auto grid gap-6 sm:gap-2 h-full"
        style={{
          minHeight: 0,
          gridTemplateRows: 'max-content min-content auto max-content'
        }}
      >
        <h2 className="font-bold text-base line-clamp-5 sm:line-clamp-2 lg:text-2xl overflow-hidden">
          A Story About Making a Wish to the Genie of the Lamp
        </h2>
        <div className="flex flex-wrap gap-1 select-none overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 to-indigo-600 rounded-md p-[2px] flex items-center justify-center">
            <Badge className="border-none" variant="secondary">
              Doujinshi
            </Badge>
          </div>

          <Badge variant="secondary">Action</Badge>
          <Badge variant="secondary">Comedy</Badge>
          <Badge variant="secondary">Fantasy</Badge>
          <Badge variant="secondary">Slice of Life</Badge>
        </div>
        <div className="preview-description">
          <div className="relative overflow-hidden py-0">
            <div className="md-md-container dense noEmptyLines">
              <p>
                Hijinks ensure after a boy wishes for a little sister from a
                genie.
              </p>
              <hr />
              <p>
                <strong>Alt Official Raws:</strong>{' '}
                <a
                  href="https://www.pixiv.net/user/7696500/series/195141"
                  target="_blank"
                  rel="noopener nofollow noreferrer"
                >
                  pixiv
                </a>
                ,
                <a
                  href="https://x.com/search?q=from%3A%40ikuno_27%20%E3%83%A9%E3%83%B3%E3%83%97%E3%81%AE%E9%AD%94%E4%BA%BA%E3%81%AB%E3%81%8A%E9%A1%98%E3%81%84%E3%81%99%E3%82%8B%E8%A9%B1&amp;f=live"
                  target="_blank"
                  rel="noopener nofollow noreferrer"
                >
                  X
                </a>
              </p>
              <p>
                <strong>Note:</strong> Each pixiv/niconico chapter is a
                compilation of multiple X chapters, resulting in different
                numbering.
              </p>
            </div>
          </div>
        </div>
        <div className="truncate sm:mr-36 mr-4">
          <a className="underline dark:text-blue-700" href="/">
            Ikuno Tei
          </a>
        </div>
      </div>
    </div>
  )
}
