import type {
	LivestockAssetKind,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

/**
 * Declarative map from a quick-action id (see quick-action-registry.ts) to the
 * renderer the log page should mount. Adding a new quick action means adding a
 * row here — the dispatcher stays untouched.
 */
export type LogAction =
	| { kind: "lot-create" }
	| { kind: "individual-create" }
	| {
			kind: "asset-create";
			assetKind: LivestockAssetKind;
			title: string;
			submitLabel: string;
	  }
	| {
			kind: "event";
			eventType: LivestockEventType;
			title: string;
			subtitle: string;
			/** Suggested asset kinds for the target picker; omitted = any kind. */
			assetKinds?: readonly LivestockAssetKind[];
	  }
	| { kind: "feeding"; title: string; subtitle: string }
	| { kind: "mortality"; title: string; subtitle: string };

export const LOG_ACTIONS = {
	"nuevo-lote": { kind: "lot-create" },
	"nuevo-animal": { kind: "individual-create" },
	"nuevo-material": {
		kind: "asset-create",
		assetKind: "material",
		title: "Crear material",
		submitLabel: "Crear material",
	},
	"nuevo-cultivo": {
		kind: "asset-create",
		assetKind: "crop",
		title: "Crear cultivo",
		submitLabel: "Crear cultivo",
	},
	"nuevo-equipo": {
		kind: "asset-create",
		assetKind: "equipment",
		title: "Crear equipo",
		submitLabel: "Crear equipo",
	},
	"nueva-ubicacion": {
		kind: "asset-create",
		assetKind: "location",
		title: "Crear ubicacion",
		submitLabel: "Crear ubicacion",
	},
	"nuevo-gasto": {
		kind: "event",
		eventType: "expense",
		title: "Nuevo gasto",
		subtitle: "Registra una salida de dinero sobre un activo.",
	},
	"nuevo-ingreso": {
		kind: "event",
		eventType: "income",
		title: "Nuevo ingreso",
		subtitle: "Registra una entrada de dinero sobre un activo.",
	},
	"nuevo-ajuste": {
		kind: "event",
		eventType: "expense",
		title: "Ajuste manual",
		subtitle: "Registra un ajuste financiero sobre un activo.",
	},
	"registrar-produccion": {
		kind: "event",
		eventType: "production",
		title: "Registrar produccion",
		subtitle: "Anota la produccion del dia del activo.",
		assetKinds: ["animal", "crop"],
	},
	"registrar-huevos": {
		kind: "event",
		eventType: "production",
		title: "Registrar huevos",
		subtitle: "Anota la produccion del dia del lote.",
		assetKinds: ["animal"],
	},
	"registrar-peso": {
		kind: "event",
		eventType: "observation",
		title: "Registrar peso",
		subtitle: "Anota una medicion sobre el activo o un individuo.",
		assetKinds: ["animal"],
	},
	"registrar-salud": {
		kind: "event",
		eventType: "observation",
		title: "Registrar salud",
		subtitle: "Anota un tratamiento, visita o revision.",
		assetKinds: ["animal"],
	},
	"nuevo-registro": {
		kind: "event",
		eventType: "observation",
		title: "Nuevo registro",
		subtitle: "Agrega un registro manual sobre un activo.",
	},
	"registrar-alimentacion": {
		kind: "feeding",
		title: "Registrar alimentacion",
		subtitle: "Descuenta consumo de un material e imputa al consumidor.",
	},
	"registrar-mortalidad": {
		kind: "mortality",
		title: "Registrar mortalidad",
		subtitle: "Registra bajas de un lote agrupado.",
	},
} as const satisfies Record<string, LogAction>;

export type LogActionId = keyof typeof LOG_ACTIONS;

export function resolveLogAction(actionId?: string): LogAction | undefined {
	if (!actionId) return undefined;
	return (LOG_ACTIONS as Record<string, LogAction>)[actionId];
}
