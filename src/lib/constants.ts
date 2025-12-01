// src/lib/constants.ts

export const communityCategories = [
  { value: "all", label: "Toutes les catégories" }, // 'all' for filtering, not for creation
  { value: "artisanat", label: "Artisanat" },
  { value: "services", label: "Services" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "consulting", label: "Consulting" },
  { value: "education", label: "Éducation" },
  { value: "technologie", label: "Technologie" },
  { value: "bien-etre", label: "Bien-être" },
  { value: "alimentation", label: "Alimentation" },
  { value: "mode", label: "Mode" },
  { value: "autres", label: "Autres" },
];

export const premiumTemplates = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "service-portfolio", label: "Service & Portfolio" },
  { value: "professional-portfolio", label: "Portfolio Professionnel" },
  { value: "artisan-ecommerce", label: "E-commerce Artisanal" },
];

// Define template groups for site limits
export const TEMPLATE_GROUPS = {
  PORTFOLIO_SERVICES: ["default", "service-portfolio", "professional-portfolio"],
  ECOMMERCE: ["ecommerce", "artisan-ecommerce"],
};

// Define site limits for 'user' role (free accounts)
export const FREE_ACCOUNT_SITE_LIMITS = {
  PORTFOLIO_SERVICES: 1, // 1 site for any template in this group
  ECOMMERCE: 2,          // 2 sites for any template in this group
};