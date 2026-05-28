import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
	string,
	{
		label?: React.ReactNode;
		color?: string;
	}
>;

type ChartContextProps = {
	config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

const useChart = () => {
	const context = React.useContext(ChartContext);
	if (!context) {
		throw new Error("useChart must be used within a <ChartContainer />");
	}
	return context;
};

const ChartContainer = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & {
		config: ChartConfig;
	}
>(({ className, config, style, children, ...props }, ref) => {
	const chartStyle = {
		...style,
		...Object.entries(config).reduce<Record<string, string>>(
			(acc, [key, value]) => {
				if (value.color) {
					acc[`--color-${key}`] = value.color;
				}
				return acc;
			},
			{},
		),
	} as React.CSSProperties;

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				ref={ref}
				className={cn(
					"w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50",
					className,
				)}
				style={chartStyle}
				{...props}
			>
				{children}
			</div>
		</ChartContext.Provider>
	);
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipIndicator = "line" | "dot";
type ChartTooltipPayloadItem = {
	dataKey?: string | number;
	name?: string;
	value?: number | string;
	color?: string;
};

const ChartTooltipContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & {
		active?: boolean;
		payload?: ChartTooltipPayloadItem[];
		label?: string | number;
		indicator?: TooltipIndicator;
	}
>(({ active, payload, className, indicator = "dot", ...props }, ref) => {
	const { config } = useChart();

	if (!active || !payload?.length) {
		return null;
	}

	return (
		<div
			ref={ref}
			className={cn(
				"grid min-w-36 gap-2 rounded-lg border bg-background px-2.5 py-2 text-xs shadow-md",
				className,
			)}
			{...props}
		>
			{payload.map((item: ChartTooltipPayloadItem) => {
				if (!item || typeof item.dataKey !== "string") return null;

				const itemConfig = config[item.dataKey];
				const color =
					item.color ?? itemConfig?.color ?? "var(--muted-foreground)";
				const value =
					typeof item.value === "number"
						? item.value.toLocaleString()
						: String(item.value ?? "");

				return (
					<div
						key={item.dataKey}
						className="flex items-center justify-between gap-2"
					>
						<div className="flex items-center gap-1.5 text-muted-foreground">
							{indicator === "line" ? (
								<span
									className="h-0.5 w-3 rounded-full"
									style={{ backgroundColor: color }}
								/>
							) : (
								<span
									className="size-2 rounded-full"
									style={{ backgroundColor: color }}
								/>
							)}
							<span>{itemConfig?.label ?? item.name ?? item.dataKey}</span>
						</div>
						<span className="font-medium text-foreground">{value}</span>
					</div>
				);
			})}
		</div>
	);
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
