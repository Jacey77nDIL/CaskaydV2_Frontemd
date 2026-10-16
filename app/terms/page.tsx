// app/terms/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Caskayd",
  description:
    "The terms and conditions governing your access to and use of the Caskayd creator discovery platform.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-white font-semibold text-xl md:text-2xl mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm md:text-base text-white/70 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsOfService() {
  return (
    <div className="page-wrapper font-sans">
      {/* ===== Full-page background canvas ===== */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="sun-orb"></div>
        <div className="horizon-lens-flare"></div>
        <div className="glow-left"></div>
        <div className="mountain-range">
          <div className="peaks-bg"></div>
          <div className="peaks-mid"></div>
          <div className="peaks-fg"></div>
        </div>
      </div>

      {/* ===== Sticky Navigation Bar ===== */}
      <nav className="sticky top-0 w-full backdrop-blur-md bg-black/10 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-white font-extrabold text-xl tracking-tight"
          >
            Caskayd
          </Link>
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* ===== Content ===== */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-16 md:py-20">
        <header className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-white tracking-tight mb-4 drop-shadow-md">
            Terms of Service
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: October 16, 2026
          </p>
        </header>

        <div className="section-overlay rounded-3xl border border-white/10 p-6 md:p-10">
          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
              and use of the Caskayd platform, website, and related services
              (collectively, the &ldquo;Service&rdquo;). The Service is operated
              by Caskayd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;).
            </p>
            <p>
              By creating an account or using the Service, you confirm that you
              have read, understood, and agree to be bound by these Terms. If you
              do not agree, you must not use the Service.
            </p>
          </Section>

          <Section title="2. Eligibility and Accounts">
            <p>
              You must be at least 18 years old and capable of entering into a
              binding contract to use the Service. If you use the Service on
              behalf of a company or agency, you represent that you have the
              authority to bind that entity to these Terms.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity that occurs under your
              account. You agree to provide accurate information and to notify us
              promptly of any unauthorized use or security breach.
            </p>
          </Section>

          <Section title="3. Description of the Service">
            <p>
              Caskayd provides tools that help brands, agencies, and marketers
              discover, analyze, and connect with creators and influencers. The
              Service draws on publicly available information and third-party
              data sources, and may include search, matching, analytics, saved
              campaigns, and contact details.
            </p>
            <p>
              We may modify, suspend, or discontinue any part of the Service at
              any time, with or without notice.
            </p>
          </Section>

          <Section title="4. Subscriptions and Payments">
            <List
              items={[
                "Access to certain features requires a paid subscription. Plans, prices, and included features are shown on the pricing page and may change over time.",
                "Subscription fees are billed in advance on a recurring basis and, unless required by law, are non-refundable.",
                "You may pause or cancel your subscription at any time; access continues until the end of the paid period.",
                "Where applicable, you are responsible for any taxes associated with your subscription.",
                "Search limits and other usage allowances apply as described in your selected plan. Additional usage packs may be purchased separately.",
              ]}
            />
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <List
              items={[
                "Use the Service for any unlawful, fraudulent, or harmful purpose.",
                "Scrape, harvest, resell, or redistribute data from the Service without our prior written consent.",
                "Circumvent usage limits, access controls, or security measures.",
                "Reverse engineer, decompile, or attempt to extract the source code of the Service.",
                "Use the Service to send unsolicited communications, spam, or harass creators or other users.",
                "Interfere with or disrupt the integrity or performance of the Service.",
              ]}
            />
          </Section>

          <Section title="6. Creator Information and Third-Party Data">
            <p>
              Information about creators may be compiled from public and
              third-party sources and may not always be complete, current, or
              accurate. You are responsible for independently verifying any
              information before relying on it, entering into a campaign, or
              making business decisions. Your use of creator contact information
              must comply with all applicable laws, including data protection and
              marketing regulations.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              The Service, including its software, design, text, graphics, and
              trademarks, is owned by or licensed to Caskayd and is protected by
              intellectual property laws. Subject to your compliance with these
              Terms, we grant you a limited, non-exclusive, non-transferable,
              revocable license to use the Service for your internal business
              purposes.
            </p>
          </Section>

          <Section title="8. Disclaimers">
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, whether express or
              implied, including warranties of merchantability, fitness for a
              particular purpose, and non-infringement. We do not warrant that
              the Service will be uninterrupted, error-free, or that any creator,
              campaign, or result will meet your expectations.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Caskayd and its officers,
              directors, employees, and agents will not be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              or for any loss of profits, revenue, data, or goodwill, arising out
              of or related to your use of the Service. Our total aggregate
              liability for any claim relating to the Service will not exceed the
              amount you paid to us in the twelve (12) months preceding the
              event giving rise to the claim.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Caskayd and its
              affiliates, officers, directors, employees, and agents from and
              against any claims, liabilities, damages, losses, and expenses,
              including reasonable legal fees, arising out of or in any way
              connected with your use of the Service or your violation of these
              Terms.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your access to the Service at any time
              if you breach these Terms or if we reasonably believe your use
              poses a risk to us, other users, or third parties. You may stop
              using the Service at any time. Provisions that by their nature
              should survive termination will continue to apply.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the Federal Republic of Nigeria, without regard to its
              conflict of law provisions. Any disputes arising under these Terms
              will be subject to the exclusive jurisdiction of the courts of
              Nigeria.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we do, we will
              revise the &ldquo;Last updated&rdquo; date above and, where
              appropriate, notify you. Your continued use of the Service after
              any changes means you accept the updated Terms.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>
              If you have any questions about these Terms of Service, contact us
              at{" "}
              <a
                href="mailto:jason@caskayd.com"
                className="text-[#ff6b35] hover:underline break-all"
              >
                jason@caskayd.com
              </a>
              .
            </p>
          </Section>
        </div>

        <p className="text-center text-white/50 text-sm mt-10">
          See also our{" "}
          <Link
            href="/privacy"
            className="text-[#ff6b35] hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </main>

      {/* ===== Site Footer ===== */}
      <footer className="w-full border-t border-white/10 bg-[#1c0512] py-8 px-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/60 relative z-40">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy policy
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of service
          </Link>
          <span className="text-white/20">|</span>
          <span>Copyright © 2026 Caskayd</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
