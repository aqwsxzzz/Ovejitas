import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { useLogout } from "@/features/auth/api/auth-queries";
import { useTranslation } from "react-i18next";
import { FarmInviteModal } from "@/features/farm-invitations/components/farm-invite-modal";

export const DropdownHeaderMenu = () => {
	const { farmId } = useParams({ strict: false });
	const { mutateAsync: logout } = useLogout();
	const { t } = useTranslation("dropdownMenuHeader");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant={"ghost"}
					className=""
				>
					<Menu />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-48">
				<DropdownMenuLabel className="text-center text-chart-5">
					{t("menuTitle")}
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="w-2/3 mx-auto" />
				<DropdownMenuGroup>
					<Link
						to="/farm/$farmId/dashboard"
						params={{ farmId: farmId! }}
					>
						<DropdownMenuItem>
							{t("dashboard")}
							<DropdownMenuShortcut className="text-primary text-center w-4">
								D
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<Link
						to="/farm/$farmId/species"
						params={{ farmId: farmId! }}
					>
						<DropdownMenuItem>
							{t("animals")}
							<DropdownMenuShortcut className="text-primary text-center w-4">
								A
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<Link
						to="/farm/$farmId/farms"
						params={{ farmId: farmId! }}
					>
						<DropdownMenuItem className="flex justify-between items-center">
							{t("farms")}
							<DropdownMenuShortcut className="text-primary text-center w-4">
								F
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<FarmInviteModal />
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				{/* <DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Invite</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem>Email</DropdownMenuItem>
								<DropdownMenuItem>Message</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>More coming soon!</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator /> */}
				<DropdownMenuItem
					onClick={() => logout()}
					className="text-destructive font-semibold"
				>
					{t("Logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
