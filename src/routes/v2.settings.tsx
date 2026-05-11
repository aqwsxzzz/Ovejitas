import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/api/auth-queries";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/v2/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { mutateAsync: logout } = useLogout();

	return (
		<section className="flex flex-col gap-4">
			<div className="v2-card p-5 md:p-6">
				<p className="v2-kicker">Heredado de v1</p>
				<h2 className="mt-2 text-xl font-semibold">Configuracion y cuenta</h2>
				<p className="mt-1 text-sm text-(--v2-ink-soft)">
					Las capacidades actuales de cuenta/perfil siguen disponibles durante
					la transicion.
				</p>
			</div>

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
