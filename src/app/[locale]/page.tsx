import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Estimator, { EstimatorFallback } from "@/components/Estimator";
import About from "@/components/About";
import Process from "@/components/Process";
import PortalPreview, { PortalPreviewFallback } from "@/components/PortalPreview";
import Testimonials from "@/components/Testimonials";
import FinalCta from "@/components/FinalCta";
import JsonLd from "@/components/JsonLd";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getContent } from "@/lib/content";
import { isLocale } from "@/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const content = await getContent();
  return (
    <>
      <JsonLd locale={locale} contact={{ email: content.contact.email, instagram: content.contact.instagram, phoneIntl: content.contact.phoneIntl }} />
      <Hero locale={locale} content={content} />
      <Marquee locale={locale} content={content} />
      <Portfolio locale={locale} content={content} />
      <Services locale={locale} content={content} />
      <ErrorBoundary name="estimator" fallback={<EstimatorFallback locale={locale} />}>
        <Estimator locale={locale} content={content} />
      </ErrorBoundary>
      <About locale={locale} content={content} />
      <Process locale={locale} content={content} />
      <ErrorBoundary name="portal-preview" fallback={<PortalPreviewFallback locale={locale} />}>
        <PortalPreview locale={locale} />
      </ErrorBoundary>
      <Testimonials locale={locale} content={content} />
      <FinalCta locale={locale} content={content} />
    </>
  );
}
