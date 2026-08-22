import Link from "next/link";

export function SidebarNav({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <aside className="w-full shrink-0 md:w-56">
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 md:mb-3 md:px-2">
        {title}
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 md:block md:rounded-md md:border-0 md:bg-transparent md:px-2 md:py-1.5"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
