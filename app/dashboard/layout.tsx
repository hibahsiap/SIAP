import { getAuthUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role={auth.role as "admin" | "opd"} />
      <main className="flex-1 p-2 bg-[#F9F9F9]">{children}</main>
    </div>
  );
}
