import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Cormorant_Garamond, IBM_Plex_Sans_Arabic } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getContent } from "@/lib/content";
import { t } from "@/i18n";
import { isLocale, localeDir } from "@/i18n";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const serif = Cormorant_Garamond({ subsets: ["latin"], style: ["italic"], weight: ["500"], variable: "--font-serif", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-arabic", display: "swap" });

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const other = locale === "en" ? "ar" : "en";
  const content = await getContent();
  return {
    title: `AbsyCode — ${t(content.tagline, locale)}`,
    description: t(content.heroSupport, locale),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      title: "AbsyCode",
      description: t(content.tagline, locale),
      url: `/${locale}`,
      siteName: "AbsyCode",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: other === "ar" ? "ar_EG" : "en_US",
      images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "AbsyCode" }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: "AbsyCode", description: t(content.tagline, locale), images: ["/og-image.svg"] },
    icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.svg" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const content = await getContent();
  return (
    <html lang={locale} dir={localeDir(locale)} className={`${grotesk.variable} ${mono.variable} ${serif.variable} ${arabic.variable}`}>
      <head>
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="ar" href="/ar" />
        <link rel="alternate" hrefLang="x-default" href="/en" />
      </head>
      <body className="min-h-screen antialiased">
        <Header locale={locale} content={content} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer locale={locale} content={content} />
        <WhatsAppFloat whatsapp={content.contact.whatsapp} />
      </body>
    </html>
  );
}