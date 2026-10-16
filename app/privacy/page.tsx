// app/privacy/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Caskayd",
  description:
    "How Caskayd collects, uses, stores, and protects personal information across our creator discovery platform.",
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

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: October 16, 2026
          </p>
        </header>

        <div className="section-overlay rounded-3xl border border-white/10 p-6 md:p-10">
          <Section title="1. Introduction">
            <p>
              Caskayd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;) operates a creator discovery and influencer
              marketing platform that helps brands, agencies, and marketers
              find and analyze relevant creators. This Privacy Policy explains
              what personal information we collect, how we use it, who we share
              it with, and the choices and rights you have.
            </p>
            <p>
              By accessing or using Caskayd, you agree to the collection and use
              of information in accordance with this policy. If you do not
              agree, please do not use the platform.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following categories of information:</p>
            <List
              items={[
                "Account information: your name, business or agency name, email address, and password (stored in hashed form).",
                "Payment and billing information: plan selected, subscription status, transaction references, and billing details processed by our payment providers. We do not store full card numbers.",
                "Usage information: searches performed, campaigns saved, creators viewed, features used, and actions taken within the platform.",
                "Device and technical information: IP address, browser type, operating system, device identifiers, and approximate location derived from your IP address.",
                "Communications: messages you send us, including support requests and contact form submissions.",
              ]}
            />
            <p>
              Where you connect a third-party account (for example, an email
              provider), we only access the data you explicitly authorize.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <List
              items={[
                "To create, secure, and manage your account.",
                "To provide, operate, and improve the creator discovery experience, including search, matching, and analytics features.",
                "To process subscriptions, payments, and plan upgrades.",
                "To communicate with you about your account, service updates, and support requests.",
                "To detect, prevent, and address fraud, abuse, security incidents, and technical issues.",
                "To comply with applicable legal and regulatory obligations.",
              ]}
            />
          </Section>

          <Section title="4. Creator Data and Public Sources">
            <p>
              Caskayd analyzes publicly available information about creators,
              such as follower counts, posting activity, engagement signals, and
              public profile details. We process this information to provide
              discovery and analytics features. We do not sell personal
              information to third parties. If you are a creator and would like
              to request an update or removal of your information, please
              contact us using the details below.
            </p>
          </Section>

          <Section title="5. Legal Basis for Processing">
            <p>
              Where required by law, we process personal information on the
              following bases: performance of a contract (providing the
              service), legitimate interests (improving and securing the
              platform), consent (where you have given it), and compliance with
              legal obligations.
            </p>
          </Section>

          <Section title="6. Sharing of Information">
            <p>
              We may share information with trusted third parties who help us
              operate the platform, including:
            </p>
            <List
              items={[
                "Payment processors and subscription billing providers.",
                "Cloud hosting, infrastructure, and data storage providers.",
                "Analytics and error monitoring tools.",
                "Email and communication service providers.",
                "Professional advisers, and where required, law enforcement or regulators.",
              ]}
            />
            <p>
              These providers are only given access to the information necessary
              to perform their functions and are obligated to protect it. We may
              also disclose information in connection with a merger, acquisition,
              or sale of assets, or where we believe disclosure is required by
              law.
            </p>
          </Section>

          <Section title="7. Cookies and Similar Technologies">
            <p>
              We use cookies and similar technologies to keep you signed in,
              remember your preferences, and understand how the platform is used.
              You can control cookies through your browser settings, though some
              parts of the service may not function properly if you disable them.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain personal information for as long as your account is
              active or as needed to provide the service, comply with legal
              obligations, resolve disputes, and enforce our agreements. When
              information is no longer needed, we delete or anonymize it.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              We use commercially reasonable technical and organizational
              measures, including encryption in transit and access controls, to
              protect your information. No method of transmission or storage is
              100% secure, so we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="10. Your Rights">
            <p>
              Depending on your location, you may have the right to access,
              correct, update, delete, or restrict the processing of your
              personal information, to object to processing, or to request a
              portable copy of your data. To exercise these rights, contact us
              at the email below. We will respond within the timeframe required
              by applicable law.
            </p>
          </Section>

          <Section title="11. International Transfers">
            <p>
              Your information may be transferred to and processed in countries
              other than your own. Where we transfer personal information across
              borders, we take steps to ensure it receives an adequate level of
              protection consistent with this policy.
            </p>
          </Section>

          <Section title="12. Children's Privacy">
            <p>
              Caskayd is not intended for children under the age of 18. We do not
              knowingly collect personal information from children. If you
              believe a child has provided us with personal information, please
              contact us so we can take appropriate action.
            </p>
          </Section>

          <Section title="13. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will revise the &ldquo;Last updated&rdquo; date above and, where
              appropriate, notify you. Your continued use of Caskayd after any
              changes means you accept the updated policy.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this
              Privacy Policy or your personal information, contact us at{" "}
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
            href="/terms"
            className="text-[#ff6b35] hover:underline font-medium"
          >
            Terms of Service
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
