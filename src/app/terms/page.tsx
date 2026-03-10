import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
    title: "Terms of Service — StudioShot",
    description: "Terms and conditions for using StudioShot.",
};

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main>
                <PageShell
                    title="Terms of Service"
                    description="Last updated: March 1, 2026"
                >
                    <div className="space-y-8 text-[15px] leading-[1.8] text-foreground/80">
                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using StudioShot, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">2. Description of Service</h2>
                            <p>
                                StudioShot provides AI-powered product image enhancement, including background removal, lighting correction, shadow generation, and image optimization for e-commerce platforms. The service is available through our web application and API.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">3. User Responsibilities</h2>
                            <p>
                                You are responsible for ensuring you have the right to upload and process any images submitted to StudioShot. You may not use the service for illegal purposes, to process inappropriate content, or to infringe on the intellectual property rights of others.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">4. Intellectual Property</h2>
                            <p>
                                You retain all rights to your original images and processed outputs. StudioShot does not claim any ownership over your content. Our AI models, software, brand, and website content remain the exclusive property of StudioShot.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">5. Payment & Billing</h2>
                            <p>
                                Paid plans are billed monthly. You may cancel at any time, and your access will continue until the end of the current billing period. Refunds are available within 7 days of an initial subscription for unused credits.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">6. Service Availability</h2>
                            <p>
                                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. We are not liable for any losses resulting from temporary service unavailability.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">7. Limitation of Liability</h2>
                            <p>
                                StudioShot is provided &quot;as is&quot; without warranties of any kind. Our total liability for any claim is limited to the amount you paid for the service in the 12 months preceding the claim.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-[18px] font-semibold tracking-tight text-foreground mb-3">8. Contact</h2>
                            <p>
                                For questions regarding these terms, contact us at legal@studioshot.com.
                            </p>
                        </section>
                    </div>
                </PageShell>
            </main>
            <Footer />
        </>
    );
}
