import { FarmCard } from "@/features/farm/components/farm-card";
import type { IFarm } from "@/features/farm/types/farm-types";

interface FarmCardContainerProps {
	farmList: IFarm[];
}

export const FarmCardContainer = ({ farmList }: FarmCardContainerProps) => {
	return (
		<div className="text-sidebar flex flex-col gap-2">
			{farmList?.map((farm) => (
				<FarmCard
					farm={farm}
					key={farm.id}
				/>
			))}
		</div>
	);
};
