import SignUpForm from "@/features/auth/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <div className="p-2 flex flex-col justify-center items-center">
            <h3>Welcome Home!</h3>
            <div className="flex">
            <SignUpForm />
            </div>
        </div>
    );
}
