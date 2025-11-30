import {
  NavbarSection,
  HeroSection,
  FeaturesSection,
  AboutSection,
  CalendarSection,
  CTASection,
  FooterSection,
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarSection />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="about">
          <AboutSection />
        </div>
        <div id="calendar">
          <CalendarSection />
        </div>
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}

