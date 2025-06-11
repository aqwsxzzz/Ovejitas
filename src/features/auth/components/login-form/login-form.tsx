import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/api/auth-queries";
import { useNavigate } from "@tanstack/react-router";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const LoginForm = () => {
    const { mutateAsync: login } = useLogin();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const response = await login({ payload: data });

        if (response.status === "success") {
            navigate({ to: "/dashboard" });
        }
    };
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a password" {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Login</Button>
                </form>
            </Form>
        </div>
    );
};
export default LoginForm;
