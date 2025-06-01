//import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {zodResolver} from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6),
})

const SignUpForm = () => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {email: '', name: '', password: '',}
    });



    return <div>
        <div>
            <p>Create your account</p>
            <Form {...form}>
                <form>
                    <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input 
                                placeholder="Enter your email"
                                {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}>

                    </FormField>
                </form>
            </Form>
        </div>
    </div>;
};

export default SignUpForm;
