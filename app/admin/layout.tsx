import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { name: true },
  });

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role="admin" name={user?.name ?? undefined} />
      <main className="flex-1 p-2 bg-[#F9F9F9]">{children}</main>
    </div>
  );
}
