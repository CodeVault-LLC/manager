import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entertainment/manga/$id')({
  component: RouteComponent
})

function RouteComponent() {
  // Multiple people can upload the same chapter, with different languages.
  return <div></div>
}
