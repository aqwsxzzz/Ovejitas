const dashboardCards = [
	{
		title: "Autonomy Days",
		value: "--",
		note: "Pending inventory contract",
	},
	{
		title: "Margin Risk Alerts",
		value: "--",
		note: "Pending alerts contract",
	},
	{
		title: "Actions Due Today",
		value: "--",
		note: "Pending events contract",
	},
];

export function V2DashboardPage() {
	return (
		<section className="space-y-4">
			<div className="v2-card px-5 py-4 md:px-6 md:py-5">
				<p className="v2-kicker">Week 1 checkpoint</p>
				<h2 className="mt-2 text-xl font-semibold">Dashboard Foundation</h2>
				<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
					This shell is ready to connect the first contract-first widgets.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{dashboardCards.map((card) => (
					<article
						key={card.title}
						className="v2-card p-5"
					>
						<p className="text-sm text-[color:var(--v2-ink-soft)]">
							{card.title}
						</p>
						<p className="mt-3 text-3xl font-semibold">{card.value}</p>
						<p className="mt-3 text-xs uppercase tracking-[0.08em] text-[color:var(--v2-ink-soft)]">
							{card.note}
						</p>
					</article>
				))}
			</div>
		</section>
	);
}
