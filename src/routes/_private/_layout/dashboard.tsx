import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/_layout/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/_layout/dashboard"!</div>
}
