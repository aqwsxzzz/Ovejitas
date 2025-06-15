import type { defaultNS } from "@/lib/i18n/config";
import type resources from "@/lib/i18n/resources";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof defaultNS;
        resources: typeof resources;
    }
}
