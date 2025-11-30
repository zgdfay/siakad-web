'use client';

export interface AcademicEvent {
  title: string;
  date: string;
  description?: string;
  category?: 'krs' | 'awal' | 'uts' | 'uas' | 'libur' | 'pkmb' | 'lhr';
}

interface AcademicCalendarProps {
  events?: AcademicEvent[];
  title?: string;
}

export const defaultEvents: AcademicEvent[] = [
  // Semester Ganjil 2025-2026
  {
    title: 'PKKMB',
    date: '12-14 September 2025',
    category: 'pkmb',
  },
  {
    title: 'Kegiatan KRS',
    date: '8-10 September 2025',
    category: 'krs',
  },
  {
    title: 'Awal Perkuliahan',
    date: '15 September 2025',
    category: 'awal',
  },
  {
    title: 'Ujian Tengah Semester',
    date: '3-7 November 2025',
    category: 'uts',
  },
  {
    title: 'Libur Nasional',
    date: '25-26 Desember 2025',
    category: 'libur',
  },
  {
    title: 'Ujian Akhir Semester',
    date: '5-9 Januari 2026',
    category: 'uas',
  },
  // Semester Genap 2026
  {
    title: 'Kegiatan KRS',
    date: '19-21 Januari 2026',
    category: 'krs',
  },
  {
    title: 'Awal Perkuliahan',
    date: '26 Januari 2026',
    category: 'awal',
  },
  {
    title: 'Ujian Tengah Semester',
    date: '9-13 Maret 2026',
    category: 'uts',
  },
  {
    title: 'Libur Hari Raya',
    date: '15, 29 Maret 2026',
    category: 'lhr',
  },
  {
    title: 'Ujian Akhir Semester',
    date: '2-8 Juni 2026',
    category: 'uas',
  },
];

export const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'pkmb':
      return 'bg-purple-500';
    case 'krs':
      return 'bg-yellow-500';
    case 'awal':
      return 'bg-blue-500';
    case 'uts':
      return 'bg-green-500';
    case 'uas':
      return 'bg-red-500';
    case 'libur':
      return 'bg-orange-500';
    case 'lhr':
      return 'bg-orange-500';
    default:
      return 'bg-primary';
  }
};

export const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'pkmb':
      return 'fa-solid fa-users';
    case 'krs':
      return 'fa-solid fa-clipboard-list';
    case 'awal':
      return 'fa-solid fa-graduation-cap';
    case 'uts':
      return 'fa-solid fa-file-pen';
    case 'uas':
      return 'fa-solid fa-file-circle-check';
    case 'libur':
      return 'fa-solid fa-calendar-xmark';
    case 'lhr':
      return 'fa-solid fa-moon';
    default:
      return 'fa-solid fa-calendar-days';
  }
};

export function AcademicCalendar({
  events = defaultEvents,
  title = 'Kalender Akademik',
}: AcademicCalendarProps) {
  // Pisahkan event berdasarkan semester
  const semesterGanjil = events.filter(
    (event) =>
      event.date.includes('2025') ||
      (event.date.includes('Januari 2026') && event.category === 'uas')
  );
  const semesterGenap = events.filter(
    (event) =>
      event.date.includes('2026') &&
      !(event.date.includes('Januari 2026') && event.category === 'uas')
  );

  return (
    <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">
      <div className="mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">
          {title} - Tahun Akademik 2025-2026
        </h3>
        <div className="h-1 w-16 sm:w-20 bg-primary mt-1"></div>
      </div>

      {/* Semester Ganjil */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
          Semester Ganjil 2025-2026
        </h4>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-3 sm:gap-4 min-w-max">
            {semesterGanjil.map((event, index) => (
              <div
                key={index}
                className="bg-card border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow min-w-[280px] sm:min-w-[300px] shrink-0">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${getCategoryColor(
                      event.category
                    )} flex items-center justify-center shrink-0`}>
                    <i
                      className={`${getCategoryIcon(
                        event.category
                      )} text-white text-xs sm:text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                      {event.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {event.date}
                    </p>
                    {event.description && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Semester Genap */}
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
          Semester Genap 2026
        </h4>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-3 sm:gap-4 min-w-max">
            {semesterGenap.map((event, index) => (
              <div
                key={index}
                className="bg-card border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow min-w-[280px] sm:min-w-[300px] shrink-0">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${getCategoryColor(
                      event.category
                    )} flex items-center justify-center shrink-0`}>
                    <i
                      className={`${getCategoryIcon(
                        event.category
                      )} text-white text-xs sm:text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                      {event.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {event.date}
                    </p>
                    {event.description && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
