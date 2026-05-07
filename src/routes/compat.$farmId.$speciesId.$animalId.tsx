import { createFileRoute } from "@tanstack/react-router";

// Temporary compatibility route to preserve param typings while v2 migration
// removes legacy farm/species/animal route dependencies from shared components.
export const Route = createFileRoute("/compat/$farmId/$speciesId/$animalId")({
	component: () => null,
});
