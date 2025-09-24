import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Home, LogOut, Dog, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "@tanstack/react-router";
import { useLogout } from "@/features/auth/api/auth-queries";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import type { IUser } from "@/features/auth/types/auth-types";

export function SheetMainMenu({ userData }: { userData: IUser }) {
	const { t } = useTranslation("sheetMenu");
	const { farmId } = useParams({ strict: false });
	const { mutateAsync: logout } = useLogout();
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}
		>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					className="fixed right-0 top-1/2 -translate-y-1/2 w-12 h-24 rounded-l-full rounded-r-none border-r-0 bg-background hover:bg-primary group transition-all duration-200 z-50"
					aria-label="Open menu"
				>
					<ChevronLeft className="w-5 h-5 text-primary group-hover:text-white transition-all duration-200" />
				</Button>
			</SheetTrigger>

			<SheetContent
				side="right"
				className="w-40 sm:w-96"
			>
				<div className="bg-primary/5 border-b border-primary/10 p-6">
					<div className="flex items-center space-x-4">
						<div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md">
							<span className="text-primary-foreground font-bold text-xl">
								{userData.displayName.slice(0, 1).toUpperCase()}
							</span>
						</div>
						<div>
							<h2 className="text-xl font-bold text-foreground">Mi Granja</h2>
						</div>
					</div>
				</div>

				<SheetHeader className="text-center">
					<SheetTitle>{t("menuTitle")}</SheetTitle>
				</SheetHeader>
				<SheetDescription className="sr-only"></SheetDescription>

				<div className="flex flex-col space-y-4 mt-8">
					<Link
						to="/farm/$farmId/dashboard"
						params={{ farmId: farmId! }}
						onClick={() => setOpen(false)}
					>
						<Button
							variant="ghost"
							className="justify-start h-12 px-4"
						>
							<Home className="w-5 h-5 mr-3" />
							{t("dashboard")}
						</Button>
					</Link>

					<Link
						to="/farm/$farmId/species"
						params={{ farmId: farmId! }}
						onClick={() => setOpen(false)}
					>
						<Button
							variant="ghost"
							className="justify-start h-12 px-4"
						>
							<Dog className="w-5 h-5 mr-3" />
							{t("animals")}
						</Button>
					</Link>

					<Link
						to="/farm/$farmId/farm-members"
						params={{ farmId: farmId! }}
						onClick={() => setOpen(false)}
					>
						<Button
							variant="ghost"
							className="justify-start h-12 px-4"
						>
							<Users className="w-5 h-5 mr-3" />
							{t("farmMembers")}
						</Button>
					</Link>

					<Separator />
					<Button
						variant="ghost"
						onClick={() => logout()}
						className="text-destructive font-semibold"
					>
						<LogOut className="w-5 h-5 mr-3" />
						{t("Logout")}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
