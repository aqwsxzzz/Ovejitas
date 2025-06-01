import SignUpForm from "@/features/auth/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <div className="p-2">
            <h3>Welcome Home!</h3>
            <SignUpForm />
        </div>
    );
}
