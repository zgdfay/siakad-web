import {
  NavbarSection,
  HeroSection,
  PartnerSection,
  FeaturesSection,
  AboutSection,
  FAQSection,
  FooterSection,
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarSection />
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        <PartnerSection />
        <div id="about">
          <AboutSection />
        </div>
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

