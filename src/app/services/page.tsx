import { CategoryGrid, MarketplaceIntro } from "@/components/Marketplace";
export default function ServicesPage() {
  return <main className="mx-auto max-w-6xl px-4 py-12"><MarketplaceIntro title="What can we help you find?">Choose a category to explore published vendors. Availability varies by location.</MarketplaceIntro><CategoryGrid /></main>;
}
