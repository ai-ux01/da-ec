import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/mockData";

export const metadata = {
  title: `Shipping & Returns — ${brand.name}`,
  description: `Shipping, delivery, and returns policy for ${brand.name}.`,
};

export default function ShippingReturnsPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <nav className="mb-6 text-sm text-earth-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-earth-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-earth-600">Shipping & Returns</li>
          </ol>
        </nav>
        <SectionHeading
          title="Shipping & Returns"
          subtitle="Delivery timelines, shipping zones, and our returns policy."
        />
        <div className="max-w-prose space-y-6 text-earth-600 text-sm leading-relaxed">
          <h3 className="font-serif text-earth-600 text-base font-medium">Shipping</h3>
          <p>
            We ship within India. Delivery times depend on your location and typically range from 3–7 business days after dispatch. You will receive order and shipping updates via SMS/email where provided.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Shipping charges</h3>
          <p>
            Shipping costs (if any) are shown at checkout. Free shipping may apply for orders above a certain value—check the cart for details.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Returns and refunds</h3>
          <p>
            Due to the nature of food products, we do not accept returns of opened items. If you receive a damaged or incorrect order, please contact us with your order ID and we will resolve it—replacement or refund as applicable.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Contact</h3>
          <p>
            For shipping or return queries, contact us with your order ID.
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
