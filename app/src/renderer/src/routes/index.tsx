import { createFileRoute } from '@tanstack/react-router'

import { observer } from 'mobx-react'

const WorkspaceManagementPage = observer(() => {
  return <h1>Hello world</h1>
})

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
