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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Palette, User, Phone, Mail, Image as ImageIcon } from "lucide-react"; // Importation des icônes

import { PhoneInputWithCountryCode } from "@/components/PhoneInputWithCountryCode"; // Import new component

const predefinedColors = [
  { value: "red", label: "Rouge" },
  { value: "blue", label: "Bleu" },
  { value: "green", label: "Vert" },
  { value: "yellow", label: "Jaune" },
  { value: "black", label: "Noir" },
  { value: "purple", label: "Violet" },
  { value: "orange", label: "Orange" },
  { value: "gray", label: "Gris" },
];

export function EssentialDesignStep() {
  const { control } = useFormContext();
  const maxLogoSizeMB = 2; // Max 2MB for logo/photo

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
        <Palette className="h-6 w-6 text-primary" /> Infos Essentielles & Design
      </h3>
      <p className="text-center text-muted-foreground">
        L'identité numérique de votre entreprise.
      </p>

      {/* Personal fields removed from simplified ecommerce wizard (moved to advanced editor) */}

      <FormField
        control={control}
        name="publicName"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "publicName"> }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground" /> Nom de l'entreprise / Boutique</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Mamadou Couture" {...field} />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground">
              Nom de votre entreprise/boutique.
            </p>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "category"> }) => (
          <FormItem>
            <FormLabel>Catégorie d'activité</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Mode, Électronique, Alimentation" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="whatsappNumber"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "whatsappNumber"> }) => (
          <PhoneInputWithCountryCode
            name={field.name}
            label="Numéro WhatsApp (Obligatoire)"
            placeholder="Ex: +22870000000"
            required
          />
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "email"> }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><Mail className="h-4 w-4 text-muted-foreground" /> E-mail (Optionnel)</FormLabel>
            <FormControl>
              <Input type="email" placeholder="votre@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="primaryColor"
          render={({ field }: { field: ControllerRenderProps<FieldValues, "primaryColor"> }) => (
            <FormItem>
              <FormLabel>Couleur Principale du Site</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une couleur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {predefinedColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      {color.label}
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
          name="secondaryColor"
          render={({ field }: { field: ControllerRenderProps<FieldValues, "secondaryColor"> }) => (
            <FormItem>
              <FormLabel>Couleur Secondaire du Site (Optionnel)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une couleur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {predefinedColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      {color.label}
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
          name="siteType"
          render={({ field }: { field: ControllerRenderProps<FieldValues, "siteType"> }) => (
            <FormItem>
              <FormLabel>Type de site</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="physical_products">Produits physiques</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="digital">Digital / Téléchargement</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="designStyle"
          render={({ field }: { field: ControllerRenderProps<FieldValues, "designStyle"> }) => (
            <FormItem>
              <FormLabel>Style de design</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="modern">Moderne</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="colorful">Coloré</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="logoOrPhoto"
        render={({ field: { value, onChange, ...fieldProps } }: { field: ControllerRenderProps<FieldValues, "logoOrPhoto"> }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><ImageIcon className="h-4 w-4 text-muted-foreground" /> Logo ou Photo de Profil (Optionnel)</FormLabel>
            <FormControl>
              <Input
                {...fieldProps}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0];
                  if (file && file.size > maxLogoSizeMB * 1024 * 1024) {
                    toast.error(`Le fichier est trop grand. La taille maximale est de ${maxLogoSizeMB}MB.`);
                    onChange(undefined); // Clear the field
                  } else {
                    onChange(file);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground">
              Téléchargez votre logo ou une photo de profil (max {maxLogoSizeMB}MB).
            </p>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="businessLocation"
        render={({ field }: { field: ControllerRenderProps<FieldValues, "businessLocation"> }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> Localisation de l'Entreprise</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Dakar, Sénégal" {...field} />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground">
              L'adresse principale ou la zone de service de votre entreprise.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
}