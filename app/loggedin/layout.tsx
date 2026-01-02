import { auth } from "@/auth";
import Providers from "@/providers/providers";
import { MobileNav, Sidebar } from "@/components/layout";
import { TaskDataLoader } from "@/components/functional/TaskDataLoader";

export default async function LoggedInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <Providers session={session}>
      <TaskDataLoader />
      <main className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex flex-col">
          <MobileNav />
          <div className="py-10 px-4 md:px-15 xl:px-40">{children}</div>
        </div>
      </main>
    </Providers>
  );
}
