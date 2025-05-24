import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'

import { Input } from '@manager/ui'

export const Route = createFileRoute('/policies/faq')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AuthenticationWrapper pageType={EPageTypes.PUBLIC}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Frequently Asked Questions (FAQ)</h1>
        <span className="text-sm text-bold text-gray-500">
          Get answers to your questions about using our platform.
        </span>

        <Input placeholder="Search FAQ" />
      </div>
    </AuthenticationWrapper>
  )
}
