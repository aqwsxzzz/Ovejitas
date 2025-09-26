import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Home, LogOut, Dog, Users, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import type { IUser } from "@/features/auth/types/auth-types";
import { useLogout } from "@/features/auth/api/auth-queries";
import { useTranslation } from "react-i18next";

export function SheetMainMenu({ userData }: { userData: IUser }) {
	const { mutateAsync: logout } = useLogout();
	const [open, setOpen] = useState<boolean>(false);
	const { t } = useTranslation("sheetMenu");
	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}
		>
			<SheetTrigger asChild>
				<Button
					variant="default"
					className={`fixed top-1/2 -translate-y-1/2 z-50 w-8 h-16 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 ${
						open
							? "right-[160px] sm:right-[384px] rounded-l-lg rounded-r-none"
							: "right-0 rounded-l-lg rounded-r-none"
					}`}
					aria-label={open ? "Close menu" : "Open menu"}
				>
					<ChevronLeft
						className={`w-5 h-5 text-primary-foreground transition-transform duration-300 ${
							open ? "rotate-180" : "rotate-0"
						}`}
					/>
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
					<Button
						variant="ghost"
						className="justify-start h-12 px-4"
						onClick={() => setOpen(false)}
					>
						<Home className="w-5 h-5 mr-3" />
						{t("dashboard")}
					</Button>

					<Button
						variant="ghost"
						className="justify-start h-12 px-4"
						onClick={() => setOpen(false)}
					>
						<Dog className="w-5 h-5 mr-3" />
						{t("animals")}
					</Button>

					<Button
						variant="ghost"
						className="justify-start h-12 px-4"
						onClick={() => setOpen(false)}
					>
						<Users className="w-5 h-5 mr-3" />
						{t("farmMembers")}
					</Button>

					<Separator />
					<Button
						variant="ghost"
						onClick={() => logout()}
						className="text-destructive font-semibold"
					>
						<LogOut className="w-5 h-5 mr-3" />
						{t("logout")}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
