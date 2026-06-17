import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Format a duration (ms) into "1d 4h 11m"
function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return "-";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}

// Percentage trend between current and previous value.
// Returns { up, value } where value is the rounded absolute % change.
function trend(current: number, previous: number): { up: boolean; value: number } {
  if (previous === 0) {
    return { up: current >= 0, value: current > 0 ? 100 : 0 };
  }
  const change = ((current - previous) / previous) * 100;
  return { up: change >= 0, value: Math.abs(Math.round(change)) };
}

const WEEK_COLORS = ["#F4D254", "#7BADFF", "#B9D336", "#CCA7F3"];
const WEEK_LABELS = ["First Week", "Second Week", "Third Week", "Fourth Week"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Monday 00:00 of the week containing `d`
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  return date;
}

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Scope: ADMIN sees everything; OPD only its own assigned tickets.
  let opdId: string | null = null;
  if (auth.role === "OPD") {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { opdId: true },
    });
    if (!user?.opdId) {
      return NextResponse.json({ error: "OPD not assigned" }, { status: 400 });
    }
    opdId = user.opdId;
  }

  const scope: Prisma.TicketWhereInput = opdId ? { assignedOpdId: opdId } : {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // --- Aggregate counts ---
  const [
    totalTickets,
    totalLastMonth,
    totalThisMonth,
    solvedThisMonth,
    solvedLastMonth,
    refusedTotal,
    refusedThisMonth,
    refusedLastMonth,
    doneTotal,
    typeGroups,
  ] = await Promise.all([
    prisma.ticket.count({ where: scope }),
    prisma.ticket.count({
      where: { ...scope, createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.ticket.count({ where: { ...scope, createdAt: { gte: startOfMonth } } }),
    prisma.ticket.count({
      where: { ...scope, status: "DONE", resolvedAt: { gte: startOfMonth } },
    }),
    prisma.ticket.count({
      where: {
        ...scope,
        status: "DONE",
        resolvedAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
    prisma.ticket.count({ where: { ...scope, status: "CANCELLED" } }),
    prisma.ticket.count({
      where: { ...scope, status: "CANCELLED", updatedAt: { gte: startOfMonth } },
    }),
    prisma.ticket.count({
      where: {
        ...scope,
        status: "CANCELLED",
        updatedAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
    prisma.ticket.count({ where: { ...scope, status: "DONE" } }),
    prisma.ticket.groupBy({
      by: ["type"],
      where: scope,
      _count: { _all: true },
    }),
  ]);

  // Success rate = % of all tickets that are DONE
  const successRate = totalTickets > 0 ? (doneTotal / totalTickets) * 100 : 0;
  const successRateLastMonth =
    totalLastMonth > 0 ? (solvedLastMonth / totalLastMonth) * 100 : 0;
  const successRateThisMonth =
    totalThisMonth > 0 ? (solvedThisMonth / totalThisMonth) * 100 : 0;

  const stats = {
    totalTickets: {
      number: totalTickets,
      ...trend(totalThisMonth, totalLastMonth),
    },
    solvedThisMonth: {
      number: solvedThisMonth,
      ...trend(solvedThisMonth, solvedLastMonth),
    },
    refused: {
      number: refusedTotal,
      ...trend(refusedThisMonth, refusedLastMonth),
    },
    successRate: {
      number: Math.round(successRate * 10) / 10,
      ...trend(successRateThisMonth, successRateLastMonth),
    },
  };

  // --- Messages / type distribution (Pie) ---
  const typeMap: Record<string, number> = { question: 0, feedback: 0, complaint: 0 };
  for (const g of typeGroups) {
    if (g.type === "QUESTION") typeMap.question = g._count._all;
    else if (g.type === "FEEDBACK") typeMap.feedback = g._count._all;
    else if (g.type === "COMPLAINT") typeMap.complaint = g._count._all;
  }
  const messagesDistribution = [
    { category: "question", total: typeMap.question },
    { category: "feedback", total: typeMap.feedback },
    { category: "complaint", total: typeMap.complaint },
  ];

  // --- Tickets by channel (Bar) ---
  const channels = await prisma.channel.findMany({
    select: {
      platform: true,
      _count: {
        select: { tickets: opdId ? { where: { assignedOpdId: opdId } } : true },
      },
    },
  });
  const channelMap: Record<string, number> = {
    whatsapp: 0,
    instagram: 0,
    facebook: 0,
  };
  for (const c of channels) {
    const key = c.platform.toLowerCase();
    if (key in channelMap) channelMap[key] = c._count.tickets;
  }
  const ticketsByChannel = [
    { channel: "whatsapp", total: channelMap.whatsapp },
    { channel: "instagram", total: channelMap.instagram },
    { channel: "facebook", total: channelMap.facebook },
  ];

  // --- Average response time over last 4 weeks (GroupChart) ---
  // Metric: time between a citizen (WARGA) message and the first staff (ADMIN/OPD) reply
  // that follows it in the same conversation, in hours, averaged per weekday/week.
  const fourWeeksStart = startOfWeek(now);
  fourWeeksStart.setDate(fourWeeksStart.getDate() - 21); // start of 4 weeks ago (Monday)

  // Conversation scope: ADMIN = all; OPD = conversations of tickets assigned to that OPD.
  let messageScope: Prisma.MessageWhereInput = {};
  if (opdId) {
    const opdTickets = await prisma.ticket.findMany({
      where: { assignedOpdId: opdId, conversationId: { not: null } },
      select: { conversationId: true },
    });
    const convIds = [...new Set(opdTickets.map((t) => t.conversationId).filter((c): c is string => !!c))];
    messageScope = { conversationId: { in: convIds.length > 0 ? convIds : ["__none__"] } };
  }

  const chatMessages = await prisma.message.findMany({
    where: {
      conversationId: { not: null },
      ...messageScope,
      OR: [
        { sentAt: { gte: fourWeeksStart } },
        { sentAt: null, createdAt: { gte: fourWeeksStart } },
      ],
    },
    select: { conversationId: true, senderType: true, sentAt: true, createdAt: true },
    orderBy: [{ conversationId: "asc" }, { createdAt: "asc" }],
  });

  // buckets[weekIndex][weekdayIndex] = { sum, count }
  const buckets: { sum: number; count: number }[][] = WEEK_LABELS.map(() =>
    WEEKDAYS.map(() => ({ sum: 0, count: 0 }))
  );

  // Bucket a single response gap by the weekday/week of the originating citizen message.
  const addResponse = (citizenAt: Date, hours: number) => {
    if (hours < 0) return;
    const weekStart = startOfWeek(citizenAt);
    const weekIndex = Math.floor(
      (weekStart.getTime() - fourWeeksStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (weekIndex < 0 || weekIndex > 3) return;
    const dow = citizenAt.getDay(); // 1=Mon..5=Fri
    if (dow < 1 || dow > 5) return;
    buckets[weekIndex][dow - 1].sum += hours;
    buckets[weekIndex][dow - 1].count += 1;
  };

  // Walk each conversation in chronological order; pair the first unanswered citizen
  // message with the next staff reply, then reset for the following round.
  let currentConv: string | null = null;
  let pendingCitizenAt: Date | null = null;
  for (const m of chatMessages) {
    if (m.conversationId !== currentConv) {
      currentConv = m.conversationId;
      pendingCitizenAt = null;
    }
    const ts = m.sentAt ?? m.createdAt;
    if (m.senderType === "WARGA") {
      if (pendingCitizenAt === null) pendingCitizenAt = ts;
    } else if (m.senderType === "ADMIN" || m.senderType === "OPD") {
      if (pendingCitizenAt !== null) {
        const hours = (ts.getTime() - pendingCitizenAt.getTime()) / 3600000;
        addResponse(pendingCitizenAt, hours);
        pendingCitizenAt = null;
      }
    }
  }

  const responseTime: {
    day: string;
    week: string;
    avg: number | null;
    color?: string;
  }[] = [];
  WEEK_LABELS.forEach((label, wi) => {
    WEEKDAYS.forEach((day, di) => {
      const b = buckets[wi][di];
      const avg = b.count > 0 ? Math.round((b.sum / b.count) * 10) / 10 : 0;
      // Duplicate day labels across weeks confuse recharts' XAxis keys; pad later weeks.
      responseTime.push({
        day: day + " ".repeat(wi),
        week: label,
        avg,
        color: WEEK_COLORS[wi],
      });
    });
    if (wi < WEEK_LABELS.length - 1) {
      responseTime.push({ day: "", week: "", avg: null });
    }
  });

  // --- Breakdown table ---
  // ADMIN: grouped by OPD. OPD: grouped by Category.
  const groupField: "assignedOpdId" | "categoryId" = opdId
    ? "categoryId"
    : "assignedOpdId";

  // groupBy/findMany rows carry a dynamic key (`groupField`); read it through helpers.
  type GroupRow = Record<string, string | null> & { _count: { _all: number } };
  type ResolvedRow = Record<string, unknown> & { createdAt: Date; resolvedAt: Date | null };
  const keyOf = (row: Record<string, unknown>) => row[groupField] as string | null;

  const groupSelect: Prisma.TicketSelect = {
    createdAt: true,
    resolvedAt: true,
    [groupField]: true,
  };

  const [totalsByGroup, solvedByGroup, resolvedRows] = (await Promise.all([
    prisma.ticket.groupBy({
      by: [groupField],
      where: scope,
      _count: { _all: true },
    }),
    prisma.ticket.groupBy({
      by: [groupField],
      where: { ...scope, status: "DONE" },
      _count: { _all: true },
    }),
    prisma.ticket.findMany({
      where: { ...scope, status: "DONE", resolvedAt: { not: null } },
      select: groupSelect,
    }),
  ])) as unknown as [GroupRow[], GroupRow[], ResolvedRow[]];

  const solvedCountMap = new Map<string, number>();
  for (const g of solvedByGroup) {
    const key = keyOf(g);
    if (key) solvedCountMap.set(key, g._count._all);
  }

  // avg solving time per group
  const solveAgg = new Map<string, { sum: number; count: number }>();
  for (const r of resolvedRows) {
    const key = keyOf(r);
    if (!key || !r.resolvedAt) continue;
    const ms = new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime();
    const cur = solveAgg.get(key) ?? { sum: 0, count: 0 };
    cur.sum += ms;
    cur.count += 1;
    solveAgg.set(key, cur);
  }

  // Resolve names
  const groupKeys = totalsByGroup
    .map((g) => keyOf(g))
    .filter((k): k is string => !!k);

  const nameMap = new Map<string, string>();
  if (opdId) {
    const cats = await prisma.category.findMany({
      where: { id: { in: groupKeys } },
      select: { id: true, name: true },
    });
    cats.forEach((c) => nameMap.set(c.id, c.name));
  } else {
    const opds = await prisma.opd.findMany({
      where: { id: { in: groupKeys } },
      select: { id: true, name: true },
    });
    opds.forEach((o) => nameMap.set(o.id, o.name));
  }

  const table = totalsByGroup
    .map((g) => {
      const key = keyOf(g);
      if (!key) return null;
      const agg = solveAgg.get(key);
      const labelKey = opdId ? "category" : "name";
      return {
        id: key,
        [labelKey]: nameMap.get(key) ?? "Unknown",
        totalTickets: g._count._all,
        solvedTickets: solvedCountMap.get(key) ?? 0,
        averageSolvingTime: agg ? formatDuration(agg.sum / agg.count) : "-",
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => (b.totalTickets as number) - (a.totalTickets as number));

  return NextResponse.json({
    role: auth.role,
    stats,
    messagesDistribution,
    ticketsByChannel,
    responseTime,
    table,
  });
}
