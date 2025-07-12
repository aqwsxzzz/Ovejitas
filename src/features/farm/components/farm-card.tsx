import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { IFarm } from "@/features/farm/types/farm-types";

interface FarmCardProps {
	farm: IFarm;
}

export const FarmCard = ({ farm }: FarmCardProps) => {
	return (
		<Card className="border-2 p-2 flex flex-col gap-1 min-h-0 max-w-full">
			<CardHeader className="p-2 pb-0 flex flex-row items-center justify-between">
				<div>
					<CardTitle className="text-lg font-bold leading-tight">
						{farm.name}
					</CardTitle>
					<CardDescription className="text-xs leading-tight"></CardDescription>
				</div>
			</CardHeader>
			<CardContent className="p-2 pt-1 flex flex-row gap-2 justify-between items-center"></CardContent>
		</Card>
	);
};
