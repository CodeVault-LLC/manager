import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@manager/ui'

export const Route = createFileRoute('/policies/terms')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AuthenticationWrapper pageType={EPageTypes.PUBLIC}>
      <div className="flex flex-col justify-center items-center my-8 max-w-3xl mx-auto">
        <div className="mx-auto prose prose-sm/loose lg:prose-lg/loose dark:prose-dark">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Terms of Service
              </h1>
              <p>Last updated: March 21, 2025</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p>
                By registering for and using Manager, you agree to be bound by
                these Terms of Service and all applicable laws.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                2. Use of Our Services
              </h2>
              <ul className="list-disc list-inside">
                <li>You must be at least 13 years old to use Manager.</li>
                <li>
                  You agree not to misuse our software or attempt to access it
                  in an unauthorized manner.
                </li>
                <li>
                  CodeVault LLC reserves the right to suspend accounts violating
                  these terms.
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                3. User Accounts
              </h2>
              <p>
                To use Manager, you must create an account. You are responsible
                for maintaining the security of your account credentials.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                4. Data Collection & Privacy
              </h2>
              <p>
                We collect limited user and system data to improve our software.
                See our{' '}
                <Link
                  to="/policies/privacy"
                  className="text-blue-600 dark:text-blue-400"
                >
                  Privacy Policy
                </Link>{' '}
                for more details.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                5. Limitation of Liability
              </h2>
              <p>
                CodeVault LLC is not responsible for any damages or data loss
                resulting from the use of Manager.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                6. Modifications to Terms
              </h2>
              <p>
                We may update these Terms of Service at any time. Continued use
                of Manager constitutes acceptance of the new terms.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">7. Contact</h2>
              <p>
                If you have any questions, contact us at{' '}
                <a href="mailto:codevaultllc@gmail.com">
                  codevaultllc@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <Link to="/" className="mt-8 w-full">
          <Button className="mt-8 w-full">Done</Button>
        </Link>
      </div>
    </AuthenticationWrapper>
  )
}
