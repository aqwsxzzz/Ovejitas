import "@/lib/i18n/config";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { Toaster } from "sonner";
import { CheckCircle, X } from "lucide-react";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
    },
});

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <Toaster position="top-center" icons={{ success: <CheckCircle className="text-success" />, error: <X className="text-destructive" /> }} />
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} context={{ queryClient }} />
            </QueryClientProvider>
        </StrictMode>
    );
}
