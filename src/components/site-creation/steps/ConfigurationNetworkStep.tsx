"use client";

import React from "react";
import { useFormContext, ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Globe, Facebook, Instagram, Linkedin, MessageSquare, CreditCard, Truck, EyeOff } from "lucide-react"; // Importation des icônes

export function ConfigurationNetworkStep() {
  const { control } = useFormContext();

  const contactButtonOptions = [
    { value: "whatsapp", label: "WhatsApp (Recommandé)" },
    { value: "emailForm", label: "Formulaire d'e-mail" },
  ];

  // Minimal payment options for the wizard
  const paymentMethods = [
    { id: "cash", label: "Cash à la livraison" },
    { id: "mobileMoney", label: "Mobile Money" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
        <Globe className="h-6 w-6 text-primary" /> Configuration minimale
      </h3>
      <p className="text-center text-muted-foreground">
        Étape légère : seules les options essentielles sont demandées ici. Le reste est disponible dans l'éditeur avancé après création.
      </p>

      <Separator className="my-6" />

      <FormField
        control={control}
        name="contactButtonAction"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "contactButtonAction"> }) => (
          <FormItem>
            <FormLabel>Action du bouton de contact</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Diriger vers..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {contactButtonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="showContactForm"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "showContactForm"> }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Afficher un formulaire de contact ?</FormLabel>
              <p className="text-sm text-muted-foreground">
                Utile si vous préférez un formulaire intégré plutôt que l'envoi direct sur WhatsApp.
              </p>
            </div>
          </FormItem>
        )}
      />

      <Separator className="my-6" />

      <FormField
        control={control}
        name="paymentMethods"
        render={() => (
          <FormItem>
            <FormLabel>Modes de paiement (optionnel)</FormLabel>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <FormField
                  key={method.id}
                  control={control}
                  name="paymentMethods"
                  render={({ field }: { field: ControllerRenderProps<FieldValues, "paymentMethods"> }) => {
                    return (
                      <FormItem
                        key={method.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(method.id)}
                            onCheckedChange={(checked: boolean) => {
                              return checked
                                ? field.onChange([...(field.value || []), method.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== method.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {method.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
            <p className="text-sm text-muted-foreground mt-2">Ne vous inquiétez pas si vous ne configurez pas tout maintenant — vous pourrez affiner ces options dans l'éditeur avancé.</p>
          </FormItem>
        )}
      />
    </div>
  );
}