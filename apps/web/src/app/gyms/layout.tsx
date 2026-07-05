import AnnouncementBar from '@/components/public/AnnouncementBar';
import PublicFooter from '@/components/public/Footer';
import PublicNavbar from '@/components/public/Navbar';

export default function GymsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-50">
        <AnnouncementBar />
        <PublicNavbar />
      </header>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
