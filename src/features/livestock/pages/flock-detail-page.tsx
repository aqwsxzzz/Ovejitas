import { FlockDetailPageContent } from "@/features/livestock/components/flock-detail/flock-detail-page-content";
import type { FlockDetailPageProps } from "@/features/livestock/components/flock-detail/flock-detail-types";

export function FlockDetailPage(props: FlockDetailPageProps) {
	return <FlockDetailPageContent {...props} />;
}
