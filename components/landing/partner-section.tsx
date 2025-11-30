'use client';

import Image from 'next/image';
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from '@/components/ui/shadcn-io/marquee';

const partners = [
  {
    name: 'ISEKI',
    logo: '/partner-logo/iseki.svg',
  },
  {
    name: 'PA',
    logo: '/partner-logo/pa-logo.svg',
  },
  {
    name: 'PN',
    logo: '/partner-logo/pn-logo.svg',
  },
  {
    name: 'Polres',
    logo: '/partner-logo/polres-logo.svg',
  },
  {
    name: 'SEGI',
    logo: '/partner-logo/segi-logo.svg',
  },
  {
    name: 'SPELL',
    logo: '/partner-logo/spell-logo.svg',
  },
];

export function PartnerSection() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-y overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-center text-sm sm:text-base font-medium text-muted-foreground mb-8 sm:mb-12">
          Dipercaya oleh yang terbaik
        </h2>
        <div className="relative">
          <Marquee>
            <MarqueeFade side="left" />
            <MarqueeContent pauseOnHover={false}>
              {partners.map((partner, index) => (
                <MarqueeItem key={`${partner.name}-${index}`}>
                  <div className="flex items-center justify-center h-24 sm:h-32 w-48 sm:w-64">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={256}
                      height={128}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                </MarqueeItem>
              ))}
            </MarqueeContent>
            <MarqueeFade side="right" />
          </Marquee>
        </div>
      </div>
    </section>
  );
}
