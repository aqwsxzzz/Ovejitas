import { Badge } from "@/components/ui/badge";
import type { IFlockStatus } from "@/features/flock/types/flock-types";
import { useTranslation } from "react-i18next";

interface FlockStatusBadgeProps {
	status: IFlockStatus;
}

const getStatusVariant = (
	status: IFlockStatus,
): "success" | "error" | "secondary" | "info" => {
	switch (status) {
		case "active":
			return "success";
		case "sold":
			return "info";
		case "culled":
			return "error";
		default:
			return "secondary";
	}
};

export const FlockStatusBadge = ({ status }: FlockStatusBadgeProps) => {
	const { t } = useTranslation("flocks");

	return (
		<Badge variant={getStatusVariant(status)}>{t(`status.${status}`)}</Badge>
	);
};
