import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private/_privatelayout/farm/$farmId/farm-members',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/_privatelayout/farm/$farmId/farm-members"!</div>
}
