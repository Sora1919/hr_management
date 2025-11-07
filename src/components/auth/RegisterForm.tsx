"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/api/api";
import { toast } from "sonner";
import { ca } from "zod/v4/locales";
import { refresh } from "next/cache";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "name is required",
  }),
  email: z.string().min(1, {
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  confirmPassword: z.string().min(1, {
    message: "confirmPassword is required",
  }),
});

const RegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    try {
      const createUser = await api.post("/api/users/v1/register", payload);
      if (createUser.status === 201) {
        toast.success("User created successfully");

        setTimeout(() => {
          router.push("/auth");
          location.reload();
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Sign up to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-zinc-500 dark:text-secondary">
                      name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        placeholder="Enter name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-zinc-500 dark:text-secondary">
                      email
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-zinc-500 dark:text-secondary">
                      password
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        placeholder="Enter password Text"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your password.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-zinc-500 dark:text-secondary">
                      confirmPassword
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
                        placeholder="Enter confirmPassword Text"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your confirmPassword.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="text-white dark:bg-slate-500 w-full cursor-pointer">
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default RegisterForm;
