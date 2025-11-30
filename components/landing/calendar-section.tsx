import { AcademicCalendar } from '@/components/academic/academic-calendar';

export function CalendarSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Kalender Akademik
          </h3>
          <p className="text-muted-foreground">
            Pantau jadwal penting akademik semester ini
          </p>
        </div>
        <AcademicCalendar />
      </div>
    </section>
  );
}

