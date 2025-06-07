import { MangaHeader } from '@renderer/core/components/entertainment/manga/manga-header'
import { createFileRoute } from '@tanstack/react-router'
import { TriangleAlertIcon } from 'lucide-react'

import { Input, Alert, AlertDescription, AlertTitle } from '@manager/ui'

export const Route = createFileRoute('/entertainment/manga/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Search manga..." />

      <Alert className="border-amber-500/50 text-amber-500 dark:border-amber-500 [&>svg]:text-amber-500">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Maintenance</AlertTitle>
        <AlertDescription>
          This feature is still under development phase. We are waiting until
          Mangadex releases their OAuth system. Until then this page is
          viewable, but is not the final version.
        </AlertDescription>
      </Alert>

      <div className="xs:w-[100px] h-[300px] mx-auto">
        <MangaHeader />
      </div>
    </div>
  )
}
