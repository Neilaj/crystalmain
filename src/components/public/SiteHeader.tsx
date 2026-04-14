import Link from "next/link";

interface NavItem {
  id: string;
  label: string;
  url: string;
  location: string;
  openNew: boolean;
}

interface SiteHeaderProps {
  siteLogo?: string | null;
  navigation?: NavItem[];
}

export default function SiteHeader({ siteLogo, navigation = [] }: SiteHeaderProps) {
  const headerNav = navigation.filter(
    (item) => item.location === "HEADER" || item.location === "BOTH"
  );

  return (
    <header className="sticky top-0 z-50 border-b border-red-900/20 bg-[#1a0a0a]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {siteLogo ? (
            <img src={siteLogo} alt="Crystal Studios" className="h-10 w-auto object-contain" />
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-700 to-red-900">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Crystal Studios</span>
            </>
          )}
        </Link>

        {/* Nav */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-8">
            {headerNav.map((item) => {
              const href = item.url.startsWith("#") ? `/${item.url}` : item.url;
              const isCta =
                item.label.toLowerCase().includes("contact") || item.url === "#contact";
              if (isCta) return null;
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    {...(item.openNew ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/#contact"
                className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
              >
                Get in touch
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
