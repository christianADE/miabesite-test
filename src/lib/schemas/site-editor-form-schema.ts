import { z } from "zod";

export const siteEditorFormSchema = z.object({
  // Basic Info & Branding
  publicName: z.string().min(3, "Le nom public est requis.").max(50, "Le nom public ne peut pas dépasser 50 caractères."),
  whatsappNumber: z.string().regex(/^\+?\d{8,15}$/, "Veuillez entrer un numéro WhatsApp valide."),
  secondaryPhoneNumber: z.string().regex(/^\+?\d{8,15}$/, "Veuillez entrer un numéro de téléphone valide.").optional().or(z.literal('')),
  email: z.string().email("Veuillez entrer une adresse email valide.").optional().or(z.literal('')),
  primaryColor: z.string().min(1, "Veuillez sélectionner une couleur principale."),
  secondaryColor: z.string().min(1, "Veuillez sélectionner une couleur secondaire."),
  logoOrPhoto: z.any().optional(), // File object or URL string
  businessLocation: z.string().min(3, "La localisation de l'entreprise est requise.").max(100, "La localisation ne peut pas dépasser 100 caractères."),

  // New fields for user profile (can be used in site data if desired, or just for user metadata)
  firstName: z.string().min(2, "Le prénom est requis.").max(50, "Le prénom ne peut pas dépasser 50 caractères.").optional(),
  lastName: z.string().min(2, "Le nom est requis.").max(50, "Le nom ne peut pas dépasser 50 caractères.").optional(),
  expertise: z.string().min(3, "Le domaine d'expertise est requis.").max(100, "Le domaine d'expertise ne peut pas dépasser 100 caractères.").optional(),

  // Hero Section
  heroSlogan: z.string().min(10, "Le slogan est requis.").max(100, "Le slogan ne peut pas dépasser 100 caractères."),
  aboutStory: z.string().min(50, "Votre histoire/mission est requise.").max(500, "Votre histoire/mission ne peut pas dépasser 500 caractères."),
  heroBackgroundImage: z.any().optional(), // File object or URL string

  // Products & Services
  productsAndServices: z.array(z.object({
    title: z.string().min(3, "Le titre est requis.").max(50, "Le titre ne peut pas dépasser 50 caractères."),
    price: z.preprocess(
      (val: unknown) => (val === '' ? undefined : val),
      z.coerce.number().min(0, "Le prix ne peut pas être négatif.").optional()
    ),
    currency: z.string().min(1, "La devise est requise."),
    description: z.string().min(10, "La description est requise.").max(300, "La description ne peut pas dépasser 300 caractères."),
    image: z.any().optional(), // File object or URL string
    actionButton: z.string().min(1, "L'action du bouton est requise."),
  })).max(5, "Vous ne pouvez ajouter que 5 produits/services maximum."), // Increased max to 5 for more customization

  // Testimonials
  testimonials: z.array(z.object({
    author: z.string().min(2, "Le nom de l'auteur est requis.").max(50, "Le nom ne peut pas dépasser 50 caractères."),
    quote: z.string().min(20, "Le témoignage est requis.").max(500, "Le témoignage ne peut pas dépasser 500 caractères."),
    location: z.string().min(2, "La localisation est requise.").max(50, "La localisation ne peut pas dépasser 50 caractères."),
    avatar: z.any().optional(), // File object or URL string
  })).max(5, "Vous ne pouvez ajouter que 5 témoignages maximum."), // Max 5 testimonials

  // Skills/Expertise (New section)
  skills: z.array(z.object({
    title: z.string().min(3, "Le titre de la compétence est requis.").max(50, "Le titre ne peut pas dépasser 50 caractères."),
    description: z.string().min(10, "La description est requise.").max(200, "La description ne peut pas dépasser 200 caractères."),
    icon: z.string().optional(), // Lucide icon name or similar
  })).max(10, "Vous ne pouvez ajouter que 10 compétences maximum."), // Max 10 skills

  // Social Media & Contact
  contactButtonAction: z.string().min(1, "Veuillez sélectionner une action pour le bouton de contact."),
  showContactForm: z.boolean(),
  facebookLink: z.string().url("Veuillez entrer un lien URL valide.").optional().or(z.literal('')),
  instagramLink: z.string().url("Veuillez entrer un lien URL valide.").optional().or(z.literal('')),
  linkedinLink: z.string().url("Veuillez entrer un lien URL valide.").optional().or(z.literal('')),

  // Payment & Delivery
  paymentMethods: z.array(z.string()).max(5, "Vous ne pouvez sélectionner que 5 modes de paiement maximum."),
  deliveryOption: z.string().min(1, "Veuillez sélectionner une option de livraison/déplacement."),
  depositRequired: z.boolean(),

  // Template Type (read-only in this editor, but part of site_data)
  templateType: z.string().min(1, "Le type de template est requis."),

  // Section Visibility (New)
  sectionsVisibility: z.object({
    showHero: z.boolean(),
    showAbout: z.boolean(),
    showProductsServices: z.boolean(),
    showTestimonials: z.boolean(),
    showSkills: z.boolean(),
    showContact: z.boolean(),
  }).optional(),
});

// Lightweight schema for ecommerce wizard (minimal required fields)
export const ecommerceWizardSchema = z.object({
  publicName: z.string().min(3).max(50),
  category: z.string().optional().or(z.literal('')),
  whatsappNumber: z.string().regex(/^\+?\d{8,15}$/),
  email: z.string().email().optional().or(z.literal('')),
  businessLocation: z.string().min(2).max(100).optional().or(z.literal('')),
  logoOrPhoto: z.any().optional(),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().optional().or(z.literal('')),
  siteType: z.enum(["physical_products", "services", "digital"]).optional(),
  designStyle: z.enum(["modern", "minimal", "premium", "colorful"]).optional(),
  heroSlogan: z.string().min(5).max(100).optional().or(z.literal('')),
  aboutStory: z.string().min(20).max(1000).optional().or(z.literal('')),
  heroBackgroundImage: z.any().optional(),
  productsAndServices: z.array(z.object({
    title: z.string().min(2).max(100),
    price: z.preprocess((val: unknown) => (val === '' ? undefined : val), z.coerce.number().min(0).optional()),
    currency: z.string().optional().or(z.literal('')),
    description: z.string().min(0).max(500).optional().or(z.literal('')),
    image: z.any().optional(),
    category: z.string().optional().or(z.literal('')),
    stock: z.preprocess((val: unknown) => (val === '' ? undefined : val), z.coerce.number().min(0).optional()),
    variants: z.array(z.string()).max(5).optional(),
    actionButton: z.string().optional().or(z.literal('')),
  })).max(10).optional(),
  contactButtonAction: z.string().optional().or(z.literal('')),
  facebookLink: z.string().url().optional().or(z.literal('')),
  instagramLink: z.string().url().optional().or(z.literal('')),
  paymentMethods: z.array(z.string()).optional(),
  deliveryOption: z.string().optional().or(z.literal('')),
  depositRequired: z.boolean().optional(),
  showContactForm: z.boolean().optional(),
  deliveryZones: z.array(z.string()).optional(),
  deliveryFees: z.string().optional().or(z.literal('')),
  whatsappOrderMessage: z.string().optional().or(z.literal('')),
  openingHours: z.string().optional().or(z.literal('')),
  returnPolicy: z.string().optional().or(z.literal('')),
  templateType: z.string().optional(),
});

export type SiteEditorFormData = z.infer<typeof siteEditorFormSchema>;
export type EcommerceWizardData = z.infer<typeof ecommerceWizardSchema>;
export type ProductAndService = z.infer<typeof siteEditorFormSchema>['productsAndServices'][number];
export type Testimonial = z.infer<typeof siteEditorFormSchema>['testimonials'][number];
export type Skill = z.infer<typeof siteEditorFormSchema>['skills'][number];