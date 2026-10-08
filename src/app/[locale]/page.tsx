import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Estimator from "@/components/Estimator";
import About from "@/components/About";
import Process from "@/components/Process";
import PortalPreview from "@/components/PortalPreview";
import Testimonials from "@/components/Testimonials";
import FinalCta from "@/components/FinalCta";
import JsonLd from "@/components/JsonLd";
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
      <Estimator locale={locale} content={content} />
      <About locale={locale} content={content} />
      <Process locale={locale} content={content} />
      <PortalPreview locale={locale} />
      <Testimonials locale={locale} content={content} />
      <FinalCta locale={locale} content={content} />
    </>
  );
}