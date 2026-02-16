import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/mockData";

export const metadata = {
  title: `Terms of Service — ${brand.name}`,
  description: `Terms of service for purchasing from ${brand.name}.`,
};

export default function TermsPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <nav className="mb-6 text-sm text-earth-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-earth-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-earth-600">Terms of Service</li>
          </ol>
        </nav>
        <SectionHeading
          title="Terms of Service"
          subtitle="Terms governing your use of our website and purchases."
        />
        <div className="max-w-prose space-y-6 text-earth-600 text-sm leading-relaxed">
          <p>
            By using the <strong>{brand.name}</strong> website and placing an order, you agree to these terms.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Orders and payment</h3>
          <p>
            Orders are subject to availability. Payment is due at checkout via the payment methods we offer. You must provide accurate shipping and contact details.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Cancellation and refunds</h3>
          <p>
            Cancellation and refunds are handled as per our Shipping & Returns policy. Contact us for any order issues.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Use of the site</h3>
          <p>
            You may not use the site for any unlawful purpose or in a way that could harm our systems or other users.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Changes</h3>
          <p>
            We may update these terms from time to time. Continued use after changes constitutes acceptance.
          </p>
        </div>
        <div className="mt-8">
          <Button href="/" variant="outline" size="md">
            Back to home
          </Button>
        </div>
      </Section>
    </div>
  );
}
