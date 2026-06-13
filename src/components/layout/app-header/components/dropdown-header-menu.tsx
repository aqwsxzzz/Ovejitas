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
import { useLogout } from "@/features/auth/api/auth-queries";
import { useTranslation } from "react-i18next";
export const DropdownHeaderMenu = () => {
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
			<DropdownMenuContent className="w-56">
				<div className="flex items-center justify-between gap-3 px-1 pt-1">
					<DropdownMenuLabel className="p-0 text-chart-5">
						{t("menuTitle")}
					</DropdownMenuLabel>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => logout()}
						className="h-8 px-3 text-xs"
					>
						{t("Logout")}
					</Button>
				</div>
				<DropdownMenuSeparator className="w-2/3 mx-auto" />
				<DropdownMenuGroup>
					<Link to="/v2/dashboard">
						<DropdownMenuItem>
							{t("dashboard")}
							<DropdownMenuShortcut className="text-primary text-center w-4">
								D
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<Link to="/v2/production-units">
						<DropdownMenuItem>
							{t("animals")}
							<DropdownMenuShortcut className="text-primary text-center w-4">
								A
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<Link to="/v2/production-units">
						<DropdownMenuItem className="flex justify-between items-center">
							{t("farms")}
							<DropdownMenuShortcut className="text-primary text-center w-4">
								F
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
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
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
