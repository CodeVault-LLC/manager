import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/policies/privacy')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/policies/privacy"!</div>
}
