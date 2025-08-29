import { DropdownHeaderMenu } from "@/components/layout/app-header/components/dropdown-header-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/features/auth/types/auth-types";
import { useGetFarmById } from "@/features/farm/api/farm-queries";
import { useParams } from "@tanstack/react-router";

export const AppHeader = ({ userData }: { userData: IUser }) => {
	const { farmId } = useParams({ strict: false });
	const { data: farmData } = useGetFarmById(farmId!);

	return (
		<div className="bg-card h-16 flex items-center justify-between px-4 w-screen">
			<div className="flex gap-2 items-center">
				<Avatar className="bg-foreground border-2">
					<AvatarImage></AvatarImage>
					<AvatarFallback>
						{userData.displayName.slice(0, 1).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col text-foreground items-center">
					<h1>{farmData?.name} </h1>
				</div>
			</div>
			<div className="flex items-center">
				<DropdownHeaderMenu />
			</div>
		</div>
	);
};
