import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@/features/auth/api/auth-queries";

const formSchema = z.object({
    email: z.string().email(),
    displayName: z.string().min(2, "Name must have at least 2 characters."),
    password: z.string().min(8, "Password must have at least 8 characters."),
});

const SignUpForm = () => {
    const { mutateAsync: signUp, error } = useSignUp();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", displayName: "", password: "" },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await signUp({ payload: data });
    };

    return (
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
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your name" {...field} />
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
                                <Input autoComplete="new-password" placeholder="Enter a password" {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && <p className="text-destructive">{error.message}</p>}
                <Button type="submit">Create</Button>
            </form>
        </Form>
    );
};

export default SignUpForm;
