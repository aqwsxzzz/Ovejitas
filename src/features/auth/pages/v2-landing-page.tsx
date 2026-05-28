import { Link } from "@tanstack/react-router";
import { ShieldCheck, Tractor, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const designBackgroundTexture =
	"radial-gradient(64rem 38rem at 12% 28%, rgba(90, 125, 92, 0.42), transparent 62%), radial-gradient(52rem 30rem at 84% 14%, rgba(252, 191, 92, 0.52), transparent 60%), radial-gradient(54rem 34rem at 80% 72%, rgba(118, 90, 34, 0.46), transparent 64%), radial-gradient(48rem 26rem at 32% 84%, rgba(92, 112, 80, 0.34), transparent 60%), linear-gradient(140deg, #d8bf80 0%, #f0ddac 26%, #f8edc7 52%, #e7cf92 76%, #b5934a 100%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")";

const productPreviewImage = "/landing/dashboard-preview.jpg";

const valueCards = [
	{
		icon: ShieldCheck,
		title: "Seguimiento de precision",
		description:
			"Monitorea salud, eventos y movimientos del ganado con datos claros en tiempo real.",
	},
	{
		icon: TrendingUp,
		title: "Control financiero inteligente",
		description:
			"Centraliza costos e ingresos para tomar decisiones rentables con menos incertidumbre.",
	},
];

export function V2LandingPage() {
	return (
		<div
			className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-dvh w-screen overflow-x-hidden bg-[#fef9f3] text-[#1d1b18]"
			style={{
				backgroundImage: designBackgroundTexture,
				backgroundRepeat:
					"no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat",
				backgroundSize: "cover, cover, cover, cover, cover, 220px 220px",
			}}
		>
			<header className="sticky top-0 z-40 border-b border-[#bfc8c9]/35 bg-[#fef9f3]/92 backdrop-blur-md">
				<div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 md:px-8">
					<div className="flex items-center gap-2 text-[#004349]">
						<Tractor className="h-5 w-5" />
						<p
							className="text-[2rem] leading-none font-semibold tracking-tight"
							style={{ fontFamily: "var(--font-serif)" }}
						>
							Ovejitas
						</p>
					</div>
					<Button
						asChild
						className="h-11 rounded-xl bg-[#004349] px-6 text-base font-semibold text-white hover:bg-[#0d5c63]"
					>
						<Link to="/v2/login">Iniciar sesion</Link>
					</Button>
				</div>
			</header>

			<main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 md:px-8 md:py-12">
				<section className="space-y-5">
					<h1
						className="max-w-[16ch] text-[2.65rem] leading-[1.05] font-semibold text-[#004349] md:text-[3.4rem]"
						style={{ fontFamily: "var(--font-serif)" }}
					>
						Gestiona una finca mas rentable con visibilidad total.
					</h1>
					<p className="max-w-[44ch] text-[1.4rem] leading-9 text-[#3f484a] md:text-[1.58rem] md:leading-10">
						Unimos la tradicion ganadera con precision avanzada para quienes
						operan en campo y toman decisiones todos los dias.
					</p>

					<div className="flex flex-col gap-3">
						<Button
							asChild
							className="h-16 rounded-xl bg-[#004349] text-lg font-semibold text-white shadow-[0_8px_20px_-12px_rgba(0,67,73,0.55)] hover:bg-[#0d5c63]"
						>
							<Link to="/v2/signup">Comenzar</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="h-16 rounded-xl border-2 border-[#004349] bg-transparent text-lg font-medium text-[#004349] hover:bg-[#004349]/6"
						>
							<Link to="/v2/login">Iniciar sesion</Link>
						</Button>
					</div>
				</section>

				<section>
					<Card className="overflow-hidden rounded-3xl border border-[#bfc8c9]/40 bg-[#f8f3ed] p-2 shadow-[0_20px_46px_-24px_rgba(73,100,85,0.5)]">
						<CardContent className="relative rounded-2xl border border-[#bfc8c9]/35 bg-[#fffef9] p-2">
							<img
								src={productPreviewImage}
								alt="Vista de panel productivo"
								className="w-full rounded-xl object-cover"
							/>
							<div className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-[#ccead6] px-4 py-2 text-sm font-medium text-[#324c3e] shadow-md">
								<TrendingUp className="h-4 w-4" />
								Seguimiento de ROI en tiempo real
							</div>
						</CardContent>
					</Card>
				</section>

				<section className="grid gap-6 pb-8 md:grid-cols-2">
					{valueCards.map((item) => (
						<Card
							key={item.title}
							className="rounded-3xl border border-[#bfc8c9]/35 bg-[#f2ede7]/95 shadow-[0_14px_30px_-24px_rgba(73,100,85,0.55)]"
						>
							<CardContent className="space-y-4 px-6 py-7">
								<item.icon className="h-8 w-8 text-[#5c3100]" />
								<h2
									className="text-5xl leading-tight font-medium text-[#004349]"
									style={{ fontFamily: "var(--font-serif)" }}
								>
									{item.title}
								</h2>
								<p className="text-[1.35rem] leading-10 text-[#3f484a]">
									{item.description}
								</p>
							</CardContent>
						</Card>
					))}
				</section>
			</main>

			<footer className="border-t border-[#bfc8c9]/35 bg-[#ffffffcc] py-12 backdrop-blur-sm">
				<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 text-[#1d1b18] md:px-8">
					<p
						className="text-5xl font-medium text-[#004349]"
						style={{ fontFamily: "var(--font-serif)" }}
					>
						Ovejitas
					</p>
					<p className="text-base text-[#3f484a]">
						© 2026 Ovejitas. Soluciones rurales modernas.
					</p>
					<div className="mt-1 flex items-center gap-7 text-base text-[#3f484a]">
						<a
							className="underline underline-offset-4"
							href="#"
						>
							Privacidad
						</a>
						<a
							className="underline underline-offset-4"
							href="#"
						>
							Terminos
						</a>
						<a
							className="underline underline-offset-4"
							href="#"
						>
							Contacto
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
