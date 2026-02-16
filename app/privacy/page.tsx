import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/mockData";

export const metadata = {
  title: `Privacy Policy — ${brand.name}`,
  description: `Privacy policy for ${brand.name}. How we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <nav className="mb-6 text-sm text-earth-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-earth-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-earth-600">Privacy Policy</li>
          </ol>
        </nav>
        <SectionHeading
          title="Privacy Policy"
          subtitle="How we collect, use, and protect your information."
        />
        <div className="max-w-prose space-y-6 text-earth-600 text-sm leading-relaxed">
          <p>
            <strong>{brand.name}</strong> (“we”) respects your privacy. This policy describes what data we collect when you use our website and place orders, and how we use it.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Information we collect</h3>
          <p>
            When you place an order, we collect your phone number (for login and OTP), name, shipping address, and order details. We do not store payment card details; payments are processed by Razorpay.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">How we use it</h3>
          <p>
            We use your information to fulfil orders, send order updates (including SMS where applicable), and improve our service. We do not sell your data to third parties.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Data retention and security</h3>
          <p>
            We retain order and address data as needed for business and legal purposes. We take reasonable steps to keep your data secure.
          </p>
          <h3 className="font-serif text-earth-600 text-base font-medium mt-6">Contact</h3>
          <p>
            For privacy-related questions, contact us through the details on our website.
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
