import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import OrderNotifier from "@/components/OrderNotifier";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen pb-8">
      <OrderNotifier />
      <Navbar user={user} />
      <main className="px-4 pt-4 max-w-2xl mx-auto">{children}</main>
    </div>
  );
}
