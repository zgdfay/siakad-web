'use client';

import Image from 'next/image';
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from '@/components/ui/shadcn-io/marquee';

const techStack = [
  {
    name: 'Next.js',
    logo: '/tech-stack/next-js-logo.svg',
  },
  {
    name: 'TypeScript',
    logo: '/tech-stack/ts-logo.svg',
  },
  {
    name: 'Tailwind CSS',
    logo: '/tech-stack/tailwindcss-logo.svg',
  },
  {
    name: 'shadcn/ui',
    logo: '/tech-stack/shadcn-logo.svg',
  },
  {
    name: 'Radix UI',
    logo: '/tech-stack/radix-ui-logo.svg',
  },
  {
    name: 'Prisma ORM',
    logo: '/tech-stack/prisma-orm-logo.svg',
  },
  {
    name: 'PostgreSQL',
    logo: '/tech-stack/postgreesql-logo.svg',
  },
  {
    name: 'Supabase',
    logo: '/tech-stack/supabase-logo.svg',
  },
];

export function PartnerSection() {
  return (
    <section className="py-12 sm:py-16 bg-linear-to-br from-primary/5 via-background to-primary/5 border-y overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-center text-sm sm:text-base font-medium text-muted-foreground mb-8 sm:mb-12">
          Dibangun dengan teknologi terbaru
        </h2>
        <div className="relative">
          <Marquee>
            <MarqueeFade side="left" />
            <MarqueeContent pauseOnHover={false}>
              {techStack.map((tech, index) => (
                <MarqueeItem key={`${tech.name}-${index}`}>
                  <div className="flex items-center justify-center h-16 sm:h-20 w-32 sm:w-40">
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      width={160}
                      height={80}
                      className="object-contain max-w-full max-h-full opacity-80 hover:opacity-100 transition-opacity"
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
