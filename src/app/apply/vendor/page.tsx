import { Card } from "@/components/ui";
import VendorApplicationForm from "./VendorApplicationForm";

export default async function VendorApplyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <section className="mb-8 space-y-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-brand-dark">
            Become a Vendor
          </h1>
          <p className="text-sm text-gray-600">
            Learn how the SturdiHome vendor model works, then complete the application below.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-brand-gold/30 bg-black shadow-sm">
          <video
            className="aspect-video w-full"
            controls
            playsInline
            preload="metadata"
            aria-label="SturdiHome vendor marketing video"
          >
            <source src="/videos/vendor-marketing.mp4" type="video/mp4" />
            Your browser does not support the vendor marketing video.
          </video>
        </div>
      </section>
      <p className="mb-6 text-center text-sm text-gray-600">
        Apply to join the SturdiHome vendor network. Once approved, you&apos;ll be able
        to log in and receive qualified homeowner leads in your service area.
      </p>
      <Card>
        <VendorApplicationForm next={next} />
      </Card>
    </main>
  );
}
