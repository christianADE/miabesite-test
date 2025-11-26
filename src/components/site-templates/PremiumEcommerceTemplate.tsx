"use client";

import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart, Star, Send, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PremiumEcommerceTemplateProps {
  siteData: {
    publicName?: string;
    heroSlogan?: string;
    aboutStory?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoOrPhoto?: string;
    heroBackgroundImage?: string;
    productsAndServices?: Array<{
      title: string;
      price?: number;
      currency?: string;
      description?: string;
      image?: string;
    }>;
    facebookLink?: string;
    instagramLink?: string;
    whatsappNumber?: string;
    email?: string;
  };
  subdomain?: string;
}

export function PremiumEcommerceTemplate({
  siteData,
  subdomain,
}: PremiumEcommerceTemplateProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const primaryColor = siteData.primaryColor || "#000000";
  const accentColor = siteData.secondaryColor || "#ffffff";

  const products = siteData.productsAndServices || [];
  const displayProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Navigation Premium */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/60 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {siteData.logoOrPhoto && (
              <img
                src={siteData.logoOrPhoto}
                alt={siteData.publicName}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              {siteData.publicName || "Premium Store"}
            </h1>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex gap-8 items-center">
            <a href="#products" className="text-sm hover:text-gray-600 transition">
              Produits
            </a>
            <a href="#about" className="text-sm hover:text-gray-600 transition">
              À propos
            </a>
            <a href="#contact" className="text-sm hover:text-gray-600 transition">
              Contact
            </a>
            <button
              style={{ backgroundColor: primaryColor }}
              className="px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition text-white shadow"
            >
              Panier
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white p-4 space-y-4 border-t border-gray-200">
            <a href="#products" className="block text-sm hover:text-gray-600 transition">
              Produits
            </a>
            <a href="#about" className="block text-sm hover:text-gray-600 transition">
              À propos
            </a>
            <a href="#contact" className="block text-sm hover:text-gray-600 transition">
              Contact
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section Premium */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {siteData.heroBackgroundImage ? (
            <img
              src={siteData.heroBackgroundImage}
              alt="Hero"
              className="w-full h-full object-cover opacity-40"
              style={{ transform: `translateY(${scrollY * 0.5}px)` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white via-gray-100 to-white" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white opacity-60" />

          {/* Animated orbs - softer for light theme */}
          <div
            className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-12 animate-pulse"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="absolute bottom-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-12 animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              ✨ Collection Nouvelle
            </p>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              {siteData.heroSlogan || "Bienvenue au futur"}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {siteData.aboutStory || "Découvrez notre collection ultramoderne et premium"}
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap pt-8">
            <button
              style={{ backgroundColor: primaryColor }}
              className="px-8 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition group flex items-center gap-2 shadow"
            >
              Découvrir
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button className="px-8 py-3 rounded-lg font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
              En savoir plus
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border border-white/30 rounded-full flex items-center justify-center">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Catégories Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
              Catégories
            </p>
            <h2 className="text-5xl font-bold">Explorez nos collections</h2>
          </div>

          {/* Featured Products Grid */}
          <div id="products" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-20">
            {displayProducts.map((product, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredProduct(idx)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500"
              >
                {/* Glassmorphism background */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}20 0%, ${accentColor}20 100%)`,
                  }}
                />

                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-gradient-to-br opacity-30"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                </div>

                {/* Content */}
                  <div className="relative p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-gray-800 transition">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description || "Produit premium de qualité supérieure"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      {product.price && (
                        <p className="text-2xl font-bold">
                          {product.price} <span className="text-sm text-gray-500">{product.currency || "XOF"}</span>
                        </p>
                      )}
                    </div>
                    <button
                      style={{
                        backgroundColor: hoveredProduct === idx ? primaryColor : "rgba(0,0,0,0.06)",
                      }}
                      className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                    >
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 pt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Aucun produit pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* À Propos Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-b from-transparent via-gray-50 to-transparent relative scroll-mt-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
              À propos
            </p>
            <h2 className="text-4xl font-bold leading-tight">Qui sommes-nous?</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              {siteData.aboutStory || "Nous sommes passionnés par la création de produits exceptionnels qui allient innovation, qualité et style premium."}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { label: "Produits", value: displayProducts.length },
                { label: "Clients", value: "5K+" },
                { label: "Années", value: "3+" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden group">
            {siteData.logoOrPhoto ? (
              <img
                src={siteData.logoOrPhoto}
                alt="About"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div
                className="w-full h-full bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
              Témoignages
            </p>
            <h2 className="text-4xl font-bold">Ce que nos clients disent</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Sarah M.",
                text: "Qualité exceptionnelle et service impeccable. Je suis ravie!",
                rating: 5,
              },
              {
                name: "Jean P.",
                text: "Les produits sont à la hauteur de mes attentes. Très recommandé!",
                rating: 5,
              },
              {
                name: "Marie L.",
                text: "Design moderne et livraison rapide. Parfait!",
                rating: 5,
              },
              {
                name: "Thomas D.",
                text: "Une expérience shopping premium du début à la fin.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 group"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold">
            Prêt à transformer votre style?
          </h2>
          <p className="text-xl text-gray-400">
            Découvrez notre nouvelle collection et bénéficiez de -20% sur votre première commande
          </p>
          <button
            style={{ backgroundColor: primaryColor }}
            className="px-10 py-4 rounded-lg font-semibold text-white text-lg hover:opacity-90 transition group inline-flex items-center gap-2"
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Background effect */}
        <div
          className="absolute inset-0 opacity-10 blur-3xl -z-10"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, ${accentColor} 100%)`,
          }}
        />
      </section>

      {/* Footer Premium */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{siteData.publicName || "Premium Store"}</h3>
              <p className="text-sm text-gray-400">
                Découvrez l'excellence et la modernité dans chaque produit
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#products" className="hover:text-white transition">
                    Produits
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition">
                    À propos
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Livraison
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Réseaux sociaux</h4>
              <div className="flex gap-4">
                {siteData.facebookLink && (
                  <a
                    href={siteData.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                  >
                    f
                  </a>
                )}
                {siteData.instagramLink && (
                  <a
                    href={siteData.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                  >
                    📷
                  </a>
                )}
                {siteData.whatsappNumber && (
                  <a
                    href={`https://wa.me/${siteData.whatsappNumber.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p className="text-gray-600">&copy; 2025 {siteData.publicName || "Premium Store"}. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-800 transition">
                Conditions
              </a>
              <a href="#" className="hover:text-gray-800 transition">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
