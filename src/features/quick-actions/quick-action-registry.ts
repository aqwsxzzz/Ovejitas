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

type AssetQuickActionKind =
	| "animal"
	| "crop"
	| "equipment"
	| "material"
	| "location";

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

function livestockActions(kind?: AssetQuickActionKind): QuickActionItem[] {
	if (kind === "material") {
		return [
			makeAction(
				"nuevo-material",
				"Nuevo material",
				"Crear un activo de inventario",
				"📦",
			),
		];
	}

	if (kind === "crop") {
		return [
			makeAction(
				"nuevo-cultivo",
				"Nuevo cultivo",
				"Crear un activo de cultivo",
				"🌱",
			),
		];
	}

	if (kind === "equipment") {
		return [
			makeAction(
				"nuevo-equipo",
				"Nuevo equipo",
				"Crear un activo de equipo",
				"🔧",
			),
		];
	}

	if (kind === "location") {
		return [
			makeAction(
				"nueva-ubicacion",
				"Nueva ubicacion",
				"Crear un activo de ubicacion",
				"📍",
			),
		];
	}

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

function toHumanSlug(value: string): string {
	if (!value.trim()) return "especie";
	return value.replace(/[-_]+/g, " ").trim();
}

function resolveAssetKindFromSourcePath(
	sourcePath?: string,
): AssetQuickActionKind | undefined {
	if (!sourcePath) return undefined;
	const queryIndex = sourcePath.indexOf("?");
	if (queryIndex === -1) return undefined;

	const query = sourcePath.slice(queryIndex + 1);
	const kind = new URLSearchParams(query).get("kind");
	if (
		kind === "animal" ||
		kind === "crop" ||
		kind === "equipment" ||
		kind === "material" ||
		kind === "location"
	) {
		return kind;
	}

	return undefined;
}

function resolveAssetKind(value?: string): AssetQuickActionKind | undefined {
	if (
		value === "animal" ||
		value === "crop" ||
		value === "equipment" ||
		value === "material" ||
		value === "location"
	) {
		return value;
	}

	return undefined;
}

export function getQuickActionSheetConfig(
	pathname: string,
	sourcePath?: string,
	assetKindContext?: string,
): QuickActionSheetConfig {
	if (pathname.startsWith("/v2/production-units/flock/")) {
		const unitId = decodeLastSegment(pathname) ?? "";
		const contextLabel = unitId ? `Lote ${unitId}` : undefined;
		return {
			title: contextLabel
				? `Acciones para ${contextLabel}`
				: "Acciones de lote",
			description: "Registrar rapido desde este lote.",
			contextLabel,
			actions: flockActions(),
		};
	}

	if (
		pathname.startsWith("/v2/production-units/") &&
		pathname !== "/v2/production-units" &&
		pathname !== "/v2/production-units/"
	) {
		const speciesKey = decodeLastSegment(pathname) ?? "";
		const label = toHumanSlug(speciesKey);
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
		const selectedKind =
			resolveAssetKind(assetKindContext) ??
			resolveAssetKindFromSourcePath(sourcePath);
		const titleByKind: Partial<Record<AssetQuickActionKind, string>> = {
			animal: "Acciones de ganado",
			material: "Acciones de materiales",
			crop: "Acciones de cultivos",
			equipment: "Acciones de equipos",
			location: "Acciones de ubicaciones",
		};
		const descriptionByKind: Partial<Record<AssetQuickActionKind, string>> = {
			animal: "Crear o registrar desde el modulo de ganado.",
			material: "Crear materiales para inventario.",
			crop: "Crear activos para seguimiento de cultivos.",
			equipment: "Crear activos para seguimiento de equipos.",
			location: "Crear activos para organizar ubicaciones.",
		};

		return {
			title: titleByKind[selectedKind ?? "animal"] ?? "Acciones de activos",
			description:
				descriptionByKind[selectedKind ?? "animal"] ??
				"Crear o registrar desde el modulo de activos.",
			actions: livestockActions(selectedKind),
		};
	}

	if (pathname === "/v2/inventory" || pathname === "/v2/inventory/") {
		return {
			title: "Acciones de materiales",
			description: "Crear materiales para inventario.",
			actions: livestockActions("material"),
		};
	}

	if (pathname.startsWith("/v2/inventory/materials/")) {
		return {
			title: "Acciones de material",
			description: "Crear materiales o registrar cambios de inventario.",
			actions: livestockActions("material"),
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
