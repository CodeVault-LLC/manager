import { Button } from '@renderer/components/ui/button'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/policies/privacy')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AuthenticationWrapper pageType={EPageTypes.PUBLIC}>
      <div className="flex flex-col justify-center items-center my-8 max-w-3xl mx-auto">
        <div className="mx-auto prose prose-sm/loose lg:prose-lg/loose dark:prose-dark">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="mb-4">Effective Date: March 21, 2025</p>

          <h2 className="text-xl font-semibold mt-6">1. Introduction</h2>
          <p className="mb-4">
            At CodeVault LLC, we respect your privacy. This Privacy Policy explains how we collect,
            use, and protect your information when you use Manager.
          </p>

          <h2 className="text-xl font-semibold mt-6">2. Information We Collect</h2>
          <p className="mb-4">We collect certain non-sensitive data, including:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Basic user information (name, email, etc.) during registration.</li>
            <li>Device and system information for performance optimization.</li>
            <li>Usage data to improve our software.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">3. How We Use Your Information</h2>
          <p className="mb-4">We use the collected data to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide and enhance our services.</li>
            <li>Ensure software security and performance.</li>
            <li>Communicate important updates.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">4. Data Security</h2>
          <p className="mb-4">
            We take reasonable security measures to protect your data, but we cannot guarantee
            absolute security.
          </p>

          <h2 className="text-xl font-semibold mt-6">5. Third-Party Services</h2>
          <p className="mb-4">
            We do not sell your data to third parties. Some features may rely on third-party
            integrations, which have their own privacy policies.
          </p>

          <h2 className="text-xl font-semibold mt-6">6. Changes to this Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. Continued use of Manager after
            updates means acceptance of the new policy.
          </p>

          <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
          <p className="mb-4">If you have any questions, contact us at privacy@codevaultllc.com.</p>
        </div>

        <Link to="/" className="mt-8 w-full">
          <Button className="mt-8 w-full">Done</Button>
        </Link>
      </div>
    </AuthenticationWrapper>
  )
}
