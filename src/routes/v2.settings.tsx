import { Button } from "@/components/ui/button";
import { useGetUserProfile, useLogout } from "@/features/auth/api/auth-queries";
import { FarmSettingsForm } from "@/features/farm/components/farm-settings-form";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/v2/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { mutateAsync: logout } = useLogout();
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	return (
		<section className="flex flex-col gap-4">
			<div className="v2-card p-5 md:p-6">
				<h2 className="text-xl font-semibold">Configuracion y cuenta</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Administra los datos de tu granja y tu sesion.
				</p>
			</div>

			{farmId ? (
				<FarmSettingsForm farmId={farmId} />
			) : (
				<div className="v2-card p-5">
					<p className="text-sm text-(--v2-ink-soft)">
						Selecciona una granja para administrar su configuracion.
					</p>
				</div>
			)}

			<div className="flex justify-end pt-2">
				<Button
					variant="destructive"
					onClick={() => logout()}
					className="w-full sm:w-auto"
				>
					<LogOut className="mr-2 h-4 w-4" />
					Cerrar sesion
				</Button>
			</div>
		</section>
	);
}
