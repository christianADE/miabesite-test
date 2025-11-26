"use client";

import React from "react";
import { useForm, FormProvider, SubmitHandler, ControllerRenderProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form"; // Import Form component
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { createClient } from "@/lib/supabase/client"; // Import Supabase client
import { useRouter } from "next/navigation"; // Import useRouter
import { SiteEditorFormData } from "@/lib/schemas/site-editor-form-schema"; // Import the comprehensive schema type

// Import new step components
import { EssentialDesignStep } from "./steps/EssentialDesignStep";
import { ContentStep } from "./steps/ContentStep";
// removed skills step from the streamlined ecommerce wizard
import { ConfigurationNetworkStep } from "./steps/ConfigurationNetworkStep";

// Utility function to generate a URL-friendly slug
const generateSlug = (text: string): string => {
  return text
    .toString()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

// Define the base schema as a ZodObject, now directly using SiteEditorFormData for consistency
const wizardFormSchema = z.object({
  // Étape 1: Infos Essentielles & Branding (optimisée)
  publicName: z.string().min(3, { message: "Le nom de l'entreprise/boutique est requis." }).max(50),
  category: z.string().min(2, { message: "Veuillez sélectionner une catégorie d'activité." }).optional().or(z.literal('')),
  whatsappNumber: z.string().regex(/^\+?\d{8,15}$/, { message: "Veuillez entrer un numéro WhatsApp valide (ex: +22870000000)." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }).optional().or(z.literal('')),
  businessLocation: z.string().min(2).max(100).optional().or(z.literal('')),
  logoOrPhoto: z.any().optional(), // File object or URL string
  primaryColor: z.string().min(1),
  secondaryColor: z.string().optional().or(z.literal('')),
  siteType: z.enum(["physical_products", "services", "digital"]).optional(),
  designStyle: z.enum(["modern", "minimal", "premium", "colorful"]).optional(),

  // Étape 2: Contenu & Produits/Services
  heroSlogan: z.string().min(5).max(100).optional().or(z.literal('')),
  aboutStory: z.string().min(20).max(1000).optional().or(z.literal('')),
  heroBackgroundImage: z.any().optional(), // File object or URL string

  // Produits & Services (lightweight for wizard)
  productsAndServices: z.array(z.object({
    title: z.string().min(2).max(100),
    price: z.preprocess((val: unknown) => (val === '' ? undefined : val), z.coerce.number().min(0).optional()),
    currency: z.string().min(1).optional().or(z.literal('')),
    description: z.string().min(0).max(500).optional().or(z.literal('')),
    image: z.any().optional(),
    category: z.string().optional().or(z.literal('')),
    stock: z.preprocess((val: unknown) => (val === '' ? undefined : val), z.coerce.number().min(0).optional()),
    variants: z.array(z.string()).max(5).optional(),
    actionButton: z.string().optional().or(z.literal('')),
  })).max(10).optional(),

  // Étape 3: Commandes, Paiement & Réseaux
  contactButtonAction: z.string().min(1).optional().or(z.literal('')),
  facebookLink: z.string().url().optional().or(z.literal('')),
  instagramLink: z.string().url().optional().or(z.literal('')),
  // linkedin removed from wizard (advanced editor)
  paymentMethods: z.array(z.string()).optional(),
  deliveryOption: z.string().optional().or(z.literal('')),
  depositRequired: z.boolean().optional(),
  showContactForm: z.boolean().optional(),
  deliveryZones: z.array(z.string()).optional(),
  deliveryFees: z.string().optional().or(z.literal('')),
  whatsappOrderMessage: z.string().optional().or(z.literal('')),
  openingHours: z.string().optional().or(z.literal('')),
  returnPolicy: z.string().optional().or(z.literal('')),
  templateType: z.string().min(1).optional(),
});

// Infer the type for the entire wizard form data from the schema
type WizardFormData = z.infer<typeof wizardFormSchema> & { subdomain?: string }; // Add subdomain as optional property for internal use

interface SiteCreationWizardProps {
  initialSiteData?: WizardFormData & { id?: string }; // Add id for existing sites
}

// Define separate schemas for each step
const essentialDesignStepSchema = z.object({
  publicName: wizardFormSchema.shape.publicName,
  category: wizardFormSchema.shape.category,
  whatsappNumber: wizardFormSchema.shape.whatsappNumber,
  email: wizardFormSchema.shape.email,
  businessLocation: wizardFormSchema.shape.businessLocation,
  logoOrPhoto: wizardFormSchema.shape.logoOrPhoto,
  primaryColor: wizardFormSchema.shape.primaryColor,
  secondaryColor: wizardFormSchema.shape.secondaryColor,
  siteType: wizardFormSchema.shape.siteType,
  designStyle: wizardFormSchema.shape.designStyle,
});

const contentStepSchema = z.object({
  heroSlogan: wizardFormSchema.shape.heroSlogan,
  aboutStory: wizardFormSchema.shape.aboutStory,
  heroBackgroundImage: wizardFormSchema.shape.heroBackgroundImage,
});

const productsServicesStepSchema = z.object({
  productsAndServices: wizardFormSchema.shape.productsAndServices,
});

// Simplified step schema: only the essential fields for a lightweight wizard
const configurationNetworkStepSchema = z.object({
  // Where the contact button leads (default: whatsapp)
  contactButtonAction: wizardFormSchema.shape.contactButtonAction,
  // Simple toggle to show/hide the contact form
  showContactForm: wizardFormSchema.shape.showContactForm,
  // Keep payment methods minimal in the wizard (cash / mobile money)
  paymentMethods: z.array(z.string()).optional(),
});


const steps: {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  schema: z.ZodObject<any>;
}[] = [
  {
    id: "essentialDesign",
    title: "Page 1 — Identité & Branding",
    component: EssentialDesignStep,
    schema: essentialDesignStepSchema,
  },
  {
    id: "contentProducts",
    title: "Page 2 — Contenu & Produits",
    component: ContentStep,
    schema: contentStepSchema.extend(productsServicesStepSchema.shape),
  },
  {
    id: "ordersPayments",
    title: "Page 3 — Commandes & Paiement",
    component: ConfigurationNetworkStep,
    schema: configurationNetworkStepSchema,
  },
];

// Utility function to sanitize file names for storage keys
const sanitizeFileNameForStorage = (fileName: string): string => {
  if (!fileName) return '';
  // Replace special characters (including spaces, accents) with hyphens
  // Keep alphanumeric characters, hyphens, and dots
  let sanitized = fileName
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-zA-Z0-9-.]/g, '-') // Replace non-alphanumeric (except dot and hyphen) with hyphen
    .replace(/--+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-+/, '') // Trim hyphens from start/end
    .replace(/-+$/, ''); // Trim - from end of text

  // Ensure file extension is preserved if present
  const parts = sanitized.split('.');
  if (parts.length > 1) {
    const extension = parts.pop();
    sanitized = parts.join('-') + '.' + extension;
  }

  return sanitized;
};


export function SiteCreationWizard({ initialSiteData }: SiteCreationWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null); // Define user state

  React.useEffect(() => {
    async function getUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    }
    getUser();
  }, [supabase]);

  // Define defaultValues based on the WizardFormData type
  const defaultValues: WizardFormData = {
    publicName: initialSiteData?.publicName || "",
    whatsappNumber: initialSiteData?.whatsappNumber || "",
    email: initialSiteData?.email || "",
    category: initialSiteData?.category || "",
    primaryColor: initialSiteData?.primaryColor || "blue", // Default color
    secondaryColor: initialSiteData?.secondaryColor || "red", // Default color
    logoOrPhoto: initialSiteData?.logoOrPhoto || undefined, // This will be a URL if existing, not a File
    businessLocation: initialSiteData?.businessLocation || "",

    siteType: initialSiteData?.siteType || "physical_products",
    designStyle: initialSiteData?.designStyle || "modern",

    heroSlogan: initialSiteData?.heroSlogan || "",
    aboutStory: initialSiteData?.aboutStory || "",
    heroBackgroundImage: initialSiteData?.heroBackgroundImage || undefined,

    productsAndServices: initialSiteData?.productsAndServices || [], // Initialize with an empty array, ProductsServicesStep will add one if needed
    contactButtonAction: initialSiteData?.contactButtonAction || "whatsapp", // Default to WhatsApp
    facebookLink: initialSiteData?.facebookLink || "",
    instagramLink: initialSiteData?.instagramLink || "",
    // linkedin removed from wizard defaults
    paymentMethods: initialSiteData?.paymentMethods || [],
    deliveryOption: initialSiteData?.deliveryOption || "",
    depositRequired: initialSiteData?.depositRequired || false,
    showContactForm: initialSiteData?.showContactForm !== undefined ? initialSiteData.showContactForm : true, // Default to true
    templateType: initialSiteData?.templateType || "default", // Default template
    subdomain: initialSiteData?.subdomain, // Include existing subdomain for updates
    deliveryZones: initialSiteData?.deliveryZones || [],
    deliveryFees: initialSiteData?.deliveryFees || "",
    whatsappOrderMessage: initialSiteData?.whatsappOrderMessage || "",
    openingHours: initialSiteData?.openingHours || "",
    returnPolicy: initialSiteData?.returnPolicy || "",
  };

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardFormSchema as z.ZodSchema<WizardFormData>),
    defaultValues: defaultValues,
    mode: "onChange", // Validate on change to enable/disable next button
  });

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting, errors }, // Get errors from formState
  } = methods;

  // Set the templateType value in the form if it comes from initialSiteData
  React.useEffect(() => {
    if (initialSiteData?.templateType) {
      methods.setValue('templateType', initialSiteData.templateType);
    }
  }, [initialSiteData?.templateType, methods]);


  // Determine if the current step is valid based on its schema and current errors
  const currentStepSchema = steps[currentStep].schema as z.ZodObject<any>;
  const currentStepFieldNames = Object.keys(currentStepSchema.shape) as (keyof WizardFormData)[];

  // Check if any field in the current step has an error
  const isCurrentStepValid = !currentStepFieldNames.some(fieldName => errors[fieldName]);

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep >= steps.length - 1) return;

    // Trigger validation for only the current step's fields
    const result = await trigger(currentStepFieldNames);

    if (result) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Veuillez corriger les erreurs avant de passer à l'étape suivante.");
    }
  };

  const handlePrevious = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleFileUpload = async (file: File, path: string, siteIdentifier: string): Promise<string | null> => {
    if (!file) return null;

    if (!user) { // Ensure user is defined before attempting upload
      toast.error("Utilisateur non authentifié pour le téléchargement de fichiers.");
      return null;
    }

    const sanitizedFileName = sanitizeFileNameForStorage(file.name);
    const filePath = `${user.id}/${siteIdentifier}/${path}/${Date.now()}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      toast.error(`Erreur lors du téléchargement de l'image: ${uploadError.message}`);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const onSubmit: SubmitHandler<WizardFormData> = async (data: WizardFormData) => { // Explicitly type 'data'
    if (!user) {
      toast.error("Vous devez être connecté pour créer un site.");
      router.push("/login");
      return;
    }

    // --- New: Site creation limits and template uniqueness checks ---
    if (!initialSiteData?.id) { // Only apply these checks for new site creation
      const { data: userSites, error: fetchSitesError } = await supabase
        .from('sites')
        .select('id, template_type')
        .eq('user_id', user.id);

      if (fetchSitesError) {
        console.error("Error fetching user sites for limits:", fetchSitesError);
        toast.error("Erreur lors de la vérification des limites de sites.");
        return;
      }

      if (userSites && userSites.length >= 5) {
        toast.error("Vous avez atteint la limite de 5 sites web par compte.");
        return;
      }

      const hasSameTemplate = userSites?.some(site => site.template_type === data.templateType);
      if (hasSameTemplate) {
        toast.error(`Vous avez déjà un site avec le template "${data.templateType}". Veuillez choisir un template différent.`);
        return;
      }
    }
    // --- End New: Site creation limits and template uniqueness checks ---


    let siteIdentifier = initialSiteData?.subdomain; // Use existing identifier if editing

    // If creating a new site, generate a unique identifier
    if (!initialSiteData?.id) {
      let baseSlug = generateSlug(data.publicName);
      let uniqueSlug = baseSlug;
      let counter = 0;
      let isUnique = false;

      while (!isUnique) {
        const { data: existingSite, error: checkError } = await supabase
          .from('sites')
          .select('id')
          .eq('subdomain', uniqueSlug)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means "no rows found" which is good
          console.error("Error checking identifier uniqueness:", checkError);
          toast.error("Erreur lors de la vérification de l'unicité de l'identifiant.");
          return;
        }

        if (existingSite) {
          counter++;
          uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`; // Append random string
        } else {
          isUnique = true;
        }
      }
      siteIdentifier = uniqueSlug;
    }

    // Handle file uploads (logo and product images)
    let logoUrl: string | null = null;
    let heroBackgroundImageUrl: string | null = null;
    const productImages: { [key: number]: string | null } = {};
    const testimonialAvatars: { [key: number]: string | null } = {};

    try {
      // Upload logo/photo if present and it's a new File (not an existing URL)
      if (data.logoOrPhoto instanceof File) {
        logoUrl = await handleFileUpload(data.logoOrPhoto, 'logo', siteIdentifier!);
        if (logoUrl === null) throw new Error("Logo upload failed.");
      } else if (typeof data.logoOrPhoto === 'string') {
        logoUrl = data.logoOrPhoto;
      } else {
        logoUrl = null;
      }

      // Upload hero background image
      if (data.heroBackgroundImage instanceof File) {
        heroBackgroundImageUrl = await handleFileUpload(data.heroBackgroundImage, 'hero', siteIdentifier!);
        if (heroBackgroundImageUrl === null) throw new Error("Hero background image upload failed.");
      } else if (typeof data.heroBackgroundImage === 'string') {
        heroBackgroundImageUrl = data.heroBackgroundImage;
      } else {
        heroBackgroundImageUrl = null;
      }

      // Upload product images if present and they are new Files
      if (data.productsAndServices && data.productsAndServices.length) {
        for (const [index, product] of data.productsAndServices.entries()) {
          if (product.image instanceof File) {
            productImages[index] = await handleFileUpload(product.image, `products/${index}`, siteIdentifier!);
            if (productImages[index] === null) throw new Error(`Product image ${index} upload failed.`);
          } else if (typeof product.image === 'string') {
            productImages[index] = product.image;
          } else {
            productImages[index] = null;
          }
        }
      }

      // Upload testimonial avatars if present and they are new Files
      // Prepare site_data for Supabase, replacing File objects with URLs
      const siteDataToSave: SiteEditorFormData = {
        ...data,
        logoOrPhoto: logoUrl,
        heroBackgroundImage: heroBackgroundImageUrl,
        productsAndServices: data.productsAndServices ? data.productsAndServices.map((product, index) => ({
          ...product,
          image: productImages[index] !== undefined ? productImages[index] : product.image,
        })) : [],
        // Keep other fields present in data (deliveryZones, whatsappOrderMessage, etc.)
      } as unknown as SiteEditorFormData;

      // Send site data to server-side API to create/update the site (server will enforce limits and uniqueness)
      const payload = {
        siteData: siteDataToSave,
        id: initialSiteData?.id,
        subdomain: siteIdentifier,
      };

      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Server site create/update error:', result);
        toast.error(result.error || 'Erreur lors de la création/mise à jour du site.');
        return;
      }

      const newSubdomain = result.subdomain || siteIdentifier;
      if (result.id && initialSiteData?.id) {
        toast.success('Votre site a été mis à jour avec succès !');
      } else {
        toast.success('Votre site est en cours de création !');
      }

      router.push(`/sites/${newSubdomain}`);
      router.refresh();
    } catch (error: any) {
      console.error("Site creation/update error:", error);
      toast.error(`Une erreur est survenue: ${error.message || "Impossible de créer/mettre à jour le site."}`);
    }
  };

  const CurrentStepComponent = steps.length > 0 ? steps[currentStep].component : () => <p className="text-center text-muted-foreground">Aucune étape définie pour le moment.</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted py-12">
      <Card className="w-full max-w-2xl p-6">
        <CardContent>
          <WizardProgress currentStep={currentStep} totalSteps={steps.length} />
          <Form {...methods}> {/* Use Form component here */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <CurrentStepComponent />
              <WizardNavigation
                currentStep={currentStep}
                totalSteps={steps.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isSubmitting={isSubmitting}
                isValid={isCurrentStepValid} // Pass the current step's validity
              />
            </form>
          </Form> {/* Closing Form tag added here */}
        </CardContent>
      </Card>
    </div>
  );
}