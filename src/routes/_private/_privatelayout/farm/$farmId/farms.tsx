import { FarmCardContainer } from "@/features/farm/components/farm-card-container";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/farms",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const farmList = [
		{
			id: "1",
			name: "Granja Pocha",
		},
		{
			id: "2",
			name: "El Rancho",
		},
	];

	return (
		<div>
			<FarmCardContainer farmList={farmList} />
		</div>
	);
}
