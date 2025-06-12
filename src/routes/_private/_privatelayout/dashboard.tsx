import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/_privatelayout/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/_layout/dashboard"!</div>
}
