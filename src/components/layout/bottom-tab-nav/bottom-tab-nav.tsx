import {
	Link,
	useNavigate,
	useParams,
	useRouterState,
} from "@tanstack/react-router";
import { Home, Beef, User, ReceiptText, Bird, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

interface DirectTab {
	kind: "direct";
	id: string;
	label: string;
	icon: React.ElementType;
	path: string;
}

interface GroupChild {
	id: string;
	label: string;
	icon: React.ElementType;
	path: string;
}

interface GroupTab {
	kind: "group";
	id: string;
	label: string;
	icon: React.ElementType;
	children: GroupChild[];
}

type NavTab = DirectTab | GroupTab;

export function BottomTabNav() {
	const { farmId } = useParams({ strict: false });
	const router = useRouterState();
	const currentPath = router.location.pathname;
	const { t } = useTranslation("bottomTabNav");
	const navigate = useNavigate();
	const [openGroup, setOpenGroup] = useState<string | null>(null);
	const navRef = useRef<HTMLElement>(null);

	const tabs: NavTab[] = [
		{
			kind: "direct",
			id: "dashboard",
			label: t("tabs.dashboard"),
			icon: Home,
			path: `/farm/${farmId}/dashboard`,
		},
		{
			kind: "group",
			id: "livestock",
			label: t("tabs.livestock"),
			icon: Beef,
			children: [
				{
					id: "animals",
					label: t("tabs.animals"),
					icon: Beef,
					path: `/farm/${farmId}/species`,
				},
				{
					id: "flocks",
					label: t("tabs.flocks"),
					icon: Bird,
					path: `/farm/${farmId}/flocks`,
				},
			],
		},
		{
			kind: "group",
			id: "finance",
			label: t("tabs.finance"),
			icon: ReceiptText,
			children: [
				{
					id: "expenses",
					label: t("tabs.expenses"),
					icon: ReceiptText,
					path: `/farm/${farmId}/expenses`,
				},
				{
					id: "inventory",
					label: t("tabs.inventory"),
					icon: Package,
					path: `/farm/${farmId}/inventory`,
				},
			],
		},
		{
			kind: "direct",
			id: "profile",
			label: t("tabs.profile"),
			icon: User,
			path: `/farm/${farmId}/farms`,
		},
	];

	const isPathActive = (path: string) => currentPath.startsWith(path);

	const isGroupActive = (tab: GroupTab) =>
		tab.children.some((c) => isPathActive(c.path));

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				setOpenGroup(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const navElement = navRef.current;
		if (!navElement) {
			return;
		}

		const blockNavScroll = (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
		};

		navElement.addEventListener("wheel", blockNavScroll, { passive: false });
		navElement.addEventListener("touchmove", blockNavScroll, {
			passive: false,
		});

		return () => {
			navElement.removeEventListener("wheel", blockNavScroll);
			navElement.removeEventListener("touchmove", blockNavScroll);
		};
	}, []);

	return (
		<nav
			ref={navRef}
			className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
			style={{ height: "68px" }}
			aria-label={t("ariaLabel")}
		>
			{/* Dropup panels */}
			{/* Dropup panels — anchored above each group tab */}
			{tabs.map((tab, tabIndex) => {
				if (tab.kind !== "group" || openGroup !== tab.id) return null;
				// Centre the panel over its own slot in the nav bar
				const slotPct = 100 / tabs.length;
				const leftPct = tabIndex * slotPct + slotPct / 2;
				return (
					<div
						key={`dropup-${tab.id}`}
						className="absolute bottom-full pb-2 pointer-events-none"
						style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}
					>
						<div className="flex flex-col bg-card border border-border rounded-xl shadow-lg overflow-hidden pointer-events-auto min-w-40">
							{tab.children.map((child) => {
								const ChildIcon = child.icon;
								const isActive = isPathActive(child.path);
								return (
									<button
										key={child.id}
										type="button"
										onClick={() => {
											setOpenGroup(null);
											navigate({ to: child.path });
										}}
										className={cn(
											"flex items-center gap-3 w-full px-4 py-3 transition-colors text-left",
											"hover:bg-secondary/50",
											isActive
												? "text-primary font-semibold"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										<ChildIcon
											className={cn(
												"w-5 h-5 shrink-0",
												isActive && "stroke-[2.5]",
											)}
											aria-hidden="true"
										/>
										<span className="text-sm">{child.label}</span>
									</button>
								);
							})}
						</div>
					</div>
				);
			})}

			<div className="h-full flex items-center justify-around max-w-5xl mx-auto px-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;

					if (tab.kind === "direct") {
						const isActive = isPathActive(tab.path);
						return (
							<Link
								key={tab.id}
								to={tab.path}
								className={cn(
									"flex flex-col items-center justify-center gap-1 min-w-11 px-3 py-2 rounded-lg transition-colors",
									"hover:bg-secondary/50",
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
								aria-current={isActive ? "page" : undefined}
							>
								<Icon
									className={cn(
										"w-6 h-6 transition-all",
										isActive && "stroke-[2.5]",
									)}
									aria-hidden="true"
								/>
								<span
									className={cn(
										"text-caption font-medium transition-opacity",
										isActive ? "opacity-100" : "opacity-0",
									)}
								>
									{tab.label}
								</span>
							</Link>
						);
					}

					// Group tab
					const isActive = isGroupActive(tab);
					const isOpen = openGroup === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setOpenGroup(isOpen ? null : tab.id)}
							aria-expanded={isOpen}
							className={cn(
								"flex flex-col items-center justify-center gap-1 min-w-11 px-3 py-2 rounded-lg transition-colors",
								"hover:bg-secondary/50",
								isActive || isOpen
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon
								className={cn(
									"w-6 h-6 transition-all",
									(isActive || isOpen) && "stroke-[2.5]",
								)}
								aria-hidden="true"
							/>
							<span
								className={cn(
									"text-caption font-medium transition-opacity",
									isActive || isOpen ? "opacity-100" : "opacity-0",
								)}
							>
								{tab.label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
