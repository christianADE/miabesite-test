"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from 'next/navigation'; // Assurez-vous d'importer useRouter
import { createClient } from '@/lib/supabase/client'; // Assurez-vous que le chemin est correct
import { FaGoogle, FaFacebookF, FaInstagram } from 'react-icons/fa';
import type { Provider } from '@supabase/supabase-js';
import { PhoneInputWithCountryCode } from "@/components/PhoneInputWithCountryCode";
// Only keep necessary utilities for the simplified signup
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

// Schéma Zod CORRIGÉ pour correspondre à votre formulaire
const signupSchema = z.object({
  username: z.string().min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères." }),
  phoneNumber: z.string().min(6, { message: "Numéro de téléphone invalide." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les termes et conditions.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>; // Define type for form data

export function SignupForm() {
  const router = useRouter(); // Initialisez le hook useRouter
  const supabase = createClient(); // Initialisez le client Supabase
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormData>({ // Use SignupFormData here
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setError(null);

    // Déstructuration des valeurs du formulaire
    const { email, password, username, phoneNumber } = values;

    try {
        console.log("Attempting signup with:", { email, username, phoneNumber });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            phone_number: phoneNumber,
          },
        },
      });

      if (error) {
        console.error("Erreur Supabase Auth:", error);
        setError(error.message);
        toast.error(`Erreur: ${error.message}`);
      } else if (data?.user) {
        console.log("Signup successful:", data.user.id);
        toast.success("Inscription réussie! Vérifiez votre email pour confirmer votre compte.");
        router.push(`/auth/email-sent?email=${encodeURIComponent(values.email)}`);
      } else {
        toast.success("Inscription en cours. Vérifiez votre email.");
        router.push(`/auth/email-sent?email=${encodeURIComponent(values.email)}`);
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue s'est produite.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  const handleOAuthSignIn = async (provider: Provider) => {
    try {
      console.log(`Attempting OAuth signin with ${provider}`);
      
      // Get the current origin dynamically
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      const redirectUrl = `${origin}/auth/callback`;
      
      console.log(`OAuth redirect URL: ${redirectUrl}`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          scopes: provider === 'google' ? 'openid email profile' : undefined,
        },
      });

      if (error) {
        console.error(`OAuth error with ${provider}:`, error);
        toast.error(`Erreur ${provider}: ${error.message}`);
      }
    } catch (err) {
      console.error("Erreur lors du login OAuth:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue s'est produite.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte pour commencer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}> {/* Explicitly pass the form object */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }: { field: ControllerRenderProps<SignupFormData, "username"> }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom d'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }: { field: ControllerRenderProps<SignupFormData, "phoneNumber"> }) => (
                  <PhoneInputWithCountryCode
                    name={field.name}
                    label="Numéro de téléphone"
                    placeholder="Ex: 90 00 00 00"
                    required
                  />
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: ControllerRenderProps<SignupFormData, "email"> }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: ControllerRenderProps<SignupFormData, "password"> }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }: { field: ControllerRenderProps<SignupFormData, "confirmPassword"> }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }: { field: ControllerRenderProps<SignupFormData, "termsAccepted"> }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        J'accepte les{" "}
                        <Link href="/legal" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          Conditions Générales d'Utilisation
                        </Link>{" "}
                        et la{" "}
                        <Link href="/legal" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          Politique de Confidentialité
                        </Link>
                        .
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn('google')}>
              <FaGoogle className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn('facebook')}>
              <FaFacebookF className="mr-2 h-4 w-4" /> Facebook
            </Button>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Instagram login requires additional setup and is not a direct Supabase provider.")} disabled>
              <FaInstagram className="mr-2 h-4 w-4" /> Instagram
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Connectez-vous
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}