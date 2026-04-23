import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v2/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<section className="v2-card p-5 md:p-6">
			<p className="v2-kicker">Heredado de v1</p>
			<h2 className="mt-2 text-xl font-semibold">Configuracion y cuenta</h2>
			<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
				Las capacidades actuales de cuenta/perfil siguen disponibles durante la
				transicion.
			</p>
		</section>
	);
}
