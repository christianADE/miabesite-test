"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  ChevronUp,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SiteEditorFormData } from '@/lib/schemas/site-editor-form-schema';

interface DefaultTemplateProps {
  siteData: SiteEditorFormData;
  subdomain: string;
}

export function DefaultTemplate({ siteData, subdomain }: DefaultTemplateProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const primaryColorClass = `bg-${siteData.primaryColor}-600`;
  const primaryColorTextClass = `text-${siteData.primaryColor}-600`;
  const primaryColorHoverBgClass = `hover:bg-${siteData.primaryColor}-700`;
  const primaryColorDarkBgClass = `bg-${siteData.primaryColor}-800`;

  const secondaryColorClass = `bg-${siteData.secondaryColor}-500`;
  const secondaryColorTextClass = `text-${siteData.secondaryColor}-500`;
  const secondaryColorHoverBgClass = `hover:bg-${siteData.secondaryColor}-600`;

  const sectionsVisibility = siteData.sectionsVisibility || {
    showHero: true,
    showAbout: true,
    showProductsServices: true,
    showTestimonials: true,
    showSkills: true,
    showContact: true,
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offset = 80;
      window.scrollTo({
        top: targetElement.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth',
      });
      setIsMobileMenuOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/site/${subdomain}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_name: formData.name,
          sender_email: formData.email,
          sender_phone: formData.phone,
          service_interested: formData.service || "Demande de contact général",
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Erreur lors de l'envoi du message.");
      } else {
        toast.success("Votre message a été envoyé ! Nous vous recontacterons bientôt.");
        setFormData({ name: '', phone: '', email: '', service: '', message: '' });
      }
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      toast.error("Une erreur inattendue est survenue lors de l'envoi du message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans antialiased text-foreground bg-background overflow-x-hidden" id="default-template-root">
      {/* Header */}
      <header className="bg-card shadow-lg sticky top-0 z-50" id="main-header">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3" id="logo-area">
              {siteData.logoOrPhoto ? (
                <Image src={siteData.logoOrPhoto} alt={`${siteData.publicName} Logo`} width={40} height={40} className="rounded-full object-cover" />
              ) : (
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground text-xl", primaryColorClass)} id="default-logo">
                  {siteData.publicName ? siteData.publicName.charAt(0) : 'D'}
                </div>
              )}
              <h1 className={cn("text-xl font-bold", secondaryColorTextClass)} id="site-name-header">{siteData.publicName}</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6" id="desktop-nav-menu">
              {sectionsVisibility.showAbout && <a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')} className="text-foreground font-medium hover:text-primary transition-colors">À Propos</a>}
              {sectionsVisibility.showProductsServices && siteData.productsAndServices && siteData.productsAndServices.length > 0 && <a href="#services" onClick={(e) => handleSmoothScroll(e, '#services')} className="text-foreground font-medium hover:text-primary transition-colors">Services</a>}
              {sectionsVisibility.showContact && <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')} className="text-foreground font-medium hover:text-primary transition-colors">Contact</a>}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn("md:hidden p-2 rounded-full text-foreground hover:bg-muted transition-colors", primaryColorTextClass)}
              id="btn-toggle-mobile-menu"
              aria-label="Menu mobile"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card shadow-xl py-4 z-40" id="mobile-menu-overlay">
            <nav className="flex flex-col items-center gap-4">
              {sectionsVisibility.showAbout && <a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')} className="text-foreground font-medium hover:text-primary transition-colors w-full text-center py-2 text-base">À Propos</a>}
              {sectionsVisibility.showProductsServices && siteData.productsAndServices && siteData.productsAndServices.length > 0 && <a href="#services" onClick={(e) => handleSmoothScroll(e, '#services')} className="text-foreground font-medium hover:text-primary transition-colors w-full text-center py-2 text-base">Services</a>}
              {sectionsVisibility.showContact && <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')} className="text-foreground font-medium hover:text-primary transition-colors w-full text-center py-2 text-base">Contact</a>}
            </nav>
          </div>
        )}
      </header>

      {/* 1. Hero Section */}
      {sectionsVisibility.showHero && (
        <section id="hero" className={cn("py-16 md:py-24 text-primary-foreground", primaryColorDarkBgClass)} style={{ backgroundImage: siteData.heroBackgroundImage ? `url(${siteData.heroBackgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center bg-black/30 md:bg-transparent p-6 rounded-lg">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4" id="hero-title">{siteData.publicName}</h2>
            <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto" id="hero-slogan">{siteData.heroSlogan || "Bienvenue sur notre site !"}</p>
            {sectionsVisibility.showContact && (
              <a
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, '#contact')}
                className={cn("inline-flex items-center gap-3 px-8 py-3 rounded-lg font-bold text-lg text-secondary-foreground transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg", secondaryColorClass, secondaryColorHoverBgClass)}
                id="btn-contact-hero"
              >
                <MessageSquare className="h-5 w-5" /> Contactez-nous
              </a>
            )}
          </div>
        </section>
      )}

      {/* 2. About Section */}
      {sectionsVisibility.showAbout && (
        <section id="about" className="py-12 bg-muted px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-8 md:mb-12", primaryColorTextClass)} id="about-section-title">À Propos de {siteData.publicName}</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2" id="about-text-content">
                <p className="text-foreground text-base mb-4" id="about-paragraph-1">{siteData.aboutStory || "Nous sommes une entreprise dédiée à fournir des services de qualité à nos clients. Notre engagement est de vous accompagner dans vos projets avec professionnalisme et expertise."}</p>
                <p className="text-foreground text-base mb-4" id="about-paragraph-2">{(siteData.aboutStory && siteData.aboutStory.length > 150) ? siteData.aboutStory.substring(150) : "Découvrez notre histoire et nos valeurs."}</p>
              </div>
              <div className="md:w-1/2" id="about-image-area">
                {siteData.aboutImage ? (
                  <Image src={siteData.aboutImage} alt="Image de l'entreprise" width={500} height={350} className="rounded-xl shadow-2xl object-cover w-full h-auto" />
                ) : (
                  <div className="w-full h-80 bg-secondary rounded-xl shadow-2xl flex items-center justify-center text-secondary-foreground text-xl font-semibold">Image À Propos</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Services/Products Section */}
      {sectionsVisibility.showProductsServices && siteData.productsAndServices && siteData.productsAndServices.length > 0 && (
        <section id="services" className="py-12 bg-card px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-8 md:mb-12", secondaryColorTextClass)} id="services-section-title">Nos Services / Produits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="services-list">
              {siteData.productsAndServices.map((item, index) => (
                <div key={index} id={`service-card-${index}`} className="bg-muted rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="h-40 overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={300} height={160} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center text-secondary-foreground text-xl font-semibold">Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 text-foreground" id={`service-title-${index}`}>{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3" id={`service-description-${index}`}>{item.description}</p>
                    {item.price !== undefined && (
                      <p className={cn("text-lg font-bold mb-3", primaryColorTextClass)} id={`service-price-${index}`}>
                        {item.price.toFixed(2)} {item.currency || siteData.defaultCurrency || 'XOF'}
                      </p>
                    )}
                    {sectionsVisibility.showContact && (
                      <Link
                        href="#contact"
                        onClick={(e) => handleSmoothScroll(e, '#contact')}
                        className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-secondary-foreground text-sm transition-colors duration-300", secondaryColorClass, secondaryColorHoverBgClass)}
                        id={`btn-contact-service-${index}`}
                      >
                        <MessageSquare className="h-4 w-4" /> En savoir plus
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Contact Section */}
      {sectionsVisibility.showContact && siteData.showContactForm && (
        <section id="contact" className="py-12 bg-muted px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-8 md:mb-12", primaryColorTextClass)} id="contact-section-title">Contactez-nous</h2>
            <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Informations de Contact */}
              <div id="contact-info-block">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Nos Coordonnées</h3>
                <div className="space-y-4 text-lg text-foreground">
                  {siteData.businessLocation && (
                    <div className="flex items-center gap-3" id="contact-location">
                      <MapPin className={cn("h-6 w-6 flex-shrink-0", primaryColorTextClass)} />
                      <span>{siteData.businessLocation}</span>
                    </div>
                  )}
                  {siteData.secondaryPhoneNumber && (
                    <a href={`tel:${siteData.secondaryPhoneNumber}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" id="contact-phone">
                      <Phone className={cn("h-6 w-6 flex-shrink-0", primaryColorTextClass)} />
                      <span>{siteData.secondaryPhoneNumber}</span>
                    </a>
                  )}
                  {siteData.email && (
                    <a href={`mailto:${siteData.email}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" id="contact-email">
                      <Mail className={cn("h-6 w-6 flex-shrink-0", primaryColorTextClass)} />
                      <span>{siteData.email}</span>
                    </a>
                  )}
                  {siteData.whatsappNumber && (
                    <a href={`https://wa.me/${siteData.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity" id="contact-whatsapp">
                      <MessageSquare className={cn("h-6 w-6 flex-shrink-0", primaryColorTextClass)} />
                      <span>Contactez-nous sur WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Formulaire de Contact */}
              <div id="contact-form-block">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Envoyez-nous un message</h3>
                <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
                  <div className="form-group" id="form-group-name">
                    <label htmlFor="name" className="block text-foreground font-medium mb-1 text-sm">Nom complet</label>
                    <input type="text" id="name" name="name" required className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background text-foreground" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="form-group" id="form-group-phone">
                    <label htmlFor="phone" className="block text-foreground font-medium mb-1 text-sm">Téléphone</label>
                    <input type="tel" id="phone" name="phone" required className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background text-foreground" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group" id="form-group-email">
                    <label htmlFor="email" className="block text-foreground font-medium mb-1 text-sm">Email</label>
                    <input type="email" id="email" name="email" className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background text-foreground" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-group" id="form-group-message">
                    <label htmlFor="message" className="block text-foreground font-medium mb-1 text-sm">Message</label>
                    <textarea id="message" name="message" required className="w-full px-3 py-2 border border-input rounded-lg min-h-[100px] resize-y focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background text-foreground" value={formData.message} onChange={handleChange}></textarea>
                  </div>
                  <button
                    type="submit"
                    className={cn("w-full px-5 py-2 rounded-lg font-bold text-primary-foreground text-base transition-colors duration-300", primaryColorClass, primaryColorHoverBgClass)}
                    disabled={isSubmitting}
                    id="btn-submit-contact-form"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={cn("py-6 text-primary-foreground px-4", primaryColorDarkBgClass)} id="main-footer">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="flex justify-center gap-4 mb-4" id="footer-social-links">
            {siteData.facebookLink && (
              <a href={siteData.facebookLink} target="_blank" rel="noopener noreferrer" className="text-primary-foreground hover:text-gray-300" id="footer-facebook">
                <Facebook className="h-6 w-6" />
              </a>
            )}
            {siteData.instagramLink && (
              <a href={siteData.instagramLink} target="_blank" rel="noopener noreferrer" className="text-primary-foreground hover:text-gray-300" id="footer-instagram">
                <Instagram className="h-6 w-6" />
              </a>
            )}
            {siteData.linkedinLink && (
              <a href={siteData.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-primary-foreground hover:text-gray-300" id="footer-linkedin">
                <Linkedin className="h-6 w-6" />
              </a>
            )}
            {siteData.whatsappNumber && (
              <a href={`https://wa.me/${siteData.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-primary-foreground hover:text-gray-300" id="footer-whatsapp">
                <MessageSquare className="h-6 w-6" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground" id="footer-copyright">
            © {new Date().getFullYear()} {siteData.publicName}. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn("fixed bottom-6 right-6 h-10 w-10 rounded-full flex items-center justify-center text-secondary-foreground shadow-lg transition-all duration-300 z-40", secondaryColorClass, secondaryColorHoverBgClass, showBackToTop ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4')}
        id="btn-back-to-top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}