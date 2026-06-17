// utils/dateFilter.ts  (atau langsung di file yang butuh)

export function isWithinRange(dateStr: string | undefined, rangeTime: string): boolean {
  if (!rangeTime || !dateStr) return true; // Jika tidak ada filter atau data, lolos

  // ✅ Parse tanggal dari berbagai format
  // Format tabel: "Januari, 9 2026" → perlu di-parse manual
  // Format kanban: "2024-01-15" → ISO, langsung bisa
  const date = parseDate(dateStr);
  if (!date) return true; // Jika tidak bisa parse, anggap lolos

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (rangeTime === "Today") {
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    return date >= startOfDay && date < endOfDay;
  }

  if (rangeTime === "This Week") {
    const day = now.getDay(); // 0 = Minggu
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - day);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= startOfWeek && date < endOfWeek;
  }

  if (rangeTime === "This Month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return date >= startOfMonth && date < endOfMonth;
  }

  return true;
}

// ✅ Helper parse berbagai format tanggal
function parseDate(dateStr: string): Date | null {
  // Format ISO: "2024-01-15"
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  // Format Indonesia: "Januari, 9 2026"
  const bulanMap: Record<string, number> = {
    Januari: 0, Februari: 1, Maret: 2, April: 3,
    Mei: 4, Juni: 5, Juli: 6, Agustus: 7,
    September: 8, Oktober: 9, November: 10, Desember: 11,
  };
  const match = dateStr.match(/(\w+),?\s+(\d+)\s+(\d{4})/);
  if (match) {
    const [, bulan, tgl, tahun] = match;
    const month = bulanMap[bulan];
    if (month !== undefined) {
      return new Date(Number(tahun), month, Number(tgl));
    }
  }

  return null;
}