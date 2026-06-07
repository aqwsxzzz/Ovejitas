import { Link } from "@tanstack/react-router";
import { ShieldCheck, Tractor, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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
		<div className="min-h-dvh w-full bg-background text-foreground">
			<header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
					<div className="text-primary flex items-center gap-2">
						<Tractor className="h-5 w-5" />
						<p className="text-xl font-semibold tracking-tight">Ovejitas</p>
					</div>
					<Button asChild>
						<Link to="/v2/login">Iniciar sesion</Link>
					</Button>
				</div>
			</header>

			<main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 md:px-8 md:py-14">
				<section className="space-y-5">
					<h1 className="max-w-[18ch] text-4xl font-bold tracking-tight md:text-5xl">
						Gestiona una finca mas rentable con visibilidad total.
					</h1>
					<p className="text-muted-foreground max-w-[48ch] text-lg">
						Unimos la tradicion ganadera con precision avanzada para quienes
						operan en campo y toman decisiones todos los dias.
					</p>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							asChild
							size="lg"
						>
							<Link to="/v2/signup">Comenzar</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
						>
							<Link to="/v2/login">Iniciar sesion</Link>
						</Button>
					</div>
				</section>

				<section>
					<Card className="overflow-hidden p-2">
						<CardContent className="relative rounded-lg border bg-muted p-2">
							<img
								src={productPreviewImage}
								alt="Vista de panel productivo"
								className="w-full rounded-md object-cover"
							/>
							<Badge
								variant="secondary"
								className="absolute bottom-5 right-5 gap-2 px-4 py-2 text-sm shadow-md"
							>
								<TrendingUp className="h-4 w-4" />
								Seguimiento de ROI en tiempo real
							</Badge>
						</CardContent>
					</Card>
				</section>

				<section className="grid gap-6 md:grid-cols-2">
					{valueCards.map((item) => (
						<Card key={item.title}>
							<CardHeader>
								<item.icon className="text-primary h-8 w-8" />
								<CardTitle className="text-2xl">{item.title}</CardTitle>
								<CardDescription className="text-base">
									{item.description}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</section>
			</main>

			<footer className="border-t py-12">
				<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 text-center md:px-8">
					<p className="text-primary text-2xl font-semibold">Ovejitas</p>
					<p className="text-muted-foreground text-sm">
						© 2026 Ovejitas. Soluciones rurales modernas.
					</p>
					<div className="text-muted-foreground mt-1 flex items-center gap-7 text-sm">
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
