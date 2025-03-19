import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/policies/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/policies/terms"!</div>
}
