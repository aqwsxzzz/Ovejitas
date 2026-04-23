import {
	getFlockDetailSnapshot,
	listLivestockGroups,
} from "@/shared/api/v2-mock-repository";

export interface QuickActionItem {
	id: string;
	label: string;
	description: string;
	emoji: string;
}

export interface QuickActionSheetConfig {
	title: string;
	description: string;
	contextLabel?: string;
	actions: QuickActionItem[];
}

function makeAction(
	id: string,
	label: string,
	description: string,
	emoji: string,
): QuickActionItem {
	return { id, label, description, emoji };
}

function dashboardActions(): QuickActionItem[] {
	return [
		makeAction(
			"registrar-produccion",
			"Registrar produccion",
			"Huevos, leche o produccion del dia",
			"🥚",
		),
		makeAction(
			"registrar-alimentacion",
			"Registrar alimentacion",
			"Consumo o entrega de alimento",
			"🌾",
		),
		makeAction(
			"nuevo-gasto",
			"Nuevo gasto",
			"Registrar una salida de dinero",
			"💸",
		),
		makeAction(
			"nuevo-ingreso",
			"Nuevo ingreso",
			"Registrar una entrada de dinero",
			"💰",
		),
		makeAction(
			"nuevo-animal",
			"Nuevo animal",
			"Agregar un animal al sistema",
			"🐑",
		),
		makeAction("nuevo-lote", "Nuevo lote", "Crear una unidad agrupada", "🐔"),
	];
}

function livestockActions(): QuickActionItem[] {
	return [
		makeAction("nuevo-animal", "Nuevo animal", "Agregar animal", "🐑"),
		makeAction("nuevo-lote", "Nuevo lote", "Crear lote o parvada", "🐔"),
		makeAction("registrar-peso", "Registrar peso", "Anotar una medicion", "⚖️"),
		makeAction(
			"registrar-salud",
			"Registrar salud",
			"Tratamiento, visita o revision",
			"🩺",
		),
	];
}

function speciesActions(): QuickActionItem[] {
	return [
		makeAction(
			"nuevo-animal",
			"Nuevo animal",
			"Agregar dentro de esta especie",
			"🐑",
		),
		makeAction("registrar-peso", "Registrar peso", "Nueva medicion", "⚖️"),
		makeAction("registrar-salud", "Registrar salud", "Evento sanitario", "🩺"),
		makeAction(
			"registrar-reproduccion",
			"Registrar reproduccion",
			"Monta, preniez o parto",
			"🌱",
		),
	];
}

function flockActions(): QuickActionItem[] {
	return [
		makeAction(
			"registrar-huevos",
			"Registrar huevos",
			"Produccion del dia",
			"🥚",
		),
		makeAction(
			"registrar-alimentacion",
			"Registrar alimentacion",
			"Consumo o entrega de alimento",
			"🌾",
		),
		makeAction(
			"registrar-mortalidad",
			"Registrar mortalidad",
			"Bajas o perdidas del lote",
			"⚠️",
		),
		makeAction("nuevo-gasto", "Nuevo gasto", "Costo del lote", "💸"),
	];
}

function financeActions(): QuickActionItem[] {
	return [
		makeAction("nuevo-gasto", "Nuevo gasto", "Registrar un gasto", "💸"),
		makeAction("nuevo-ingreso", "Nuevo ingreso", "Registrar un ingreso", "💰"),
		makeAction("nuevo-ajuste", "Nuevo ajuste", "Ajuste manual", "🧾"),
	];
}

function recordsActions(): QuickActionItem[] {
	return [
		makeAction(
			"nuevo-registro",
			"Nuevo registro",
			"Agregar registro manual",
			"📝",
		),
		makeAction(
			"registrar-produccion",
			"Registrar produccion",
			"Produccion del dia",
			"🥚",
		),
		makeAction("nuevo-gasto", "Nuevo gasto", "Salida de dinero", "💸"),
		makeAction("registrar-salud", "Registrar salud", "Evento sanitario", "🩺"),
	];
}

function decodeLastSegment(pathname: string): string | null {
	const parts = pathname.split("/").filter(Boolean);
	const last = parts.at(-1);
	return last ? decodeURIComponent(last) : null;
}

function findSpeciesLabel(speciesKey: string): string {
	const match = listLivestockGroups().find(
		(group) => group.categoryKey === speciesKey && group.mode === "individual",
	);
	return match?.categoryLabel ?? "especie";
}

export function getQuickActionSheetConfig(
	pathname: string,
): QuickActionSheetConfig {
	if (pathname.startsWith("/v2/production-units/flock/")) {
		const unitId = decodeLastSegment(pathname) ?? "";
		const flock = getFlockDetailSnapshot(unitId);
		return {
			title: flock ? `Acciones para ${flock.unitName}` : "Acciones de lote",
			description: "Registrar rapido desde este lote.",
			contextLabel: flock?.unitName,
			actions: flockActions(),
		};
	}

	if (
		pathname.startsWith("/v2/production-units/") &&
		pathname !== "/v2/production-units" &&
		pathname !== "/v2/production-units/"
	) {
		const speciesKey = decodeLastSegment(pathname) ?? "";
		const label = findSpeciesLabel(speciesKey);
		return {
			title: `Acciones para ${label.toLowerCase()}`,
			description: "Registrar o crear dentro de esta especie.",
			contextLabel: label,
			actions: speciesActions(),
		};
	}

	if (
		pathname === "/v2/production-units" ||
		pathname === "/v2/production-units/"
	) {
		return {
			title: "Acciones de ganado",
			description: "Crear o registrar desde el modulo de ganado.",
			actions: livestockActions(),
		};
	}

	if (pathname === "/v2/finance") {
		return {
			title: "Nuevo movimiento",
			description: "Registrar dinero que entra o sale.",
			actions: financeActions(),
		};
	}

	if (pathname === "/v2/records") {
		return {
			title: "Nuevo registro",
			description: "Agregar un registro desde el historial.",
			actions: recordsActions(),
		};
	}

	return {
		title: "¿Que quieres registrar?",
		description: "Acciones rapidas para lo que acabas de hacer.",
		actions: dashboardActions(),
	};
}
