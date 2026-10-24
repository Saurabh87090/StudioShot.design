import type { Metadata } from "next";
import{ Navbar} from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — StudioShot",
  description: "How StudioShot collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageShell
          title="Privacy Policy"
          description="Last updated: March 1, 2026"
        >
          <div className="space-y-8 text-[15px] leading-[1.8] text-foreground/80">
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                1. Information We Collect
              </h2>
              <p>
                When you use StudioShot, we collect the images you upload for
                processing. On paid plans, we collect your email address, name,
                and payment information through our payment processor. We also
                collect basic usage analytics (pages visited, features used) to
                improve the service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                2. How We Use Your Data
              </h2>
              <p>
                Uploaded images are processed by our AI model and temporarily
                stored only for the duration of processing. We do not use your
                product images to train our models. Payment information is
                handled securely by our third-party payment processor and is
                never stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                3. Data Retention
              </h2>
              <p>
                Free-tier images are automatically deleted within 1 hour of
                processing. Paid-plan images are stored for up to 30 days to
                allow re-downloads, after which they are permanently deleted.
                You may request immediate deletion of your data at any time by
                contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                4. Third-Party Services
              </h2>
              <p>
                We use third-party services for payment processing, hosting, and
                analytics. These providers have their own privacy policies and
                are contractually obligated to protect your data. We do not
                sell, rent, or share your personal information with third
                parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                5. Cookies
              </h2>
              <p>
                We use essential cookies to maintain your session and
                preferences. We use analytics cookies to understand how the
                service is used. You can disable non-essential cookies in your
                browser settings without affecting core functionality.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                6. Your Rights
              </h2>
              <p>
                You have the right to access, correct, or delete your personal
                data. You may also request a copy of all data we hold about you.
                To exercise these rights, contact us at privacy@studioshot.com.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">
                7. Contact
              </h2>
              <p>
                If you have questions about this privacy policy, contact us at
                privacy@studioshot.com.
              </p>
            </section>
          </div>
        </PageShell>
      </main>
      <Footer />
    </>
  );
}
