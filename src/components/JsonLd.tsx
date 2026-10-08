export type ContactForLd = { email: string; instagram: string; phoneIntl: string };

export default function JsonLd({
  locale,
  page = "home",
  project,
  contact,
}: {
  locale: string;
  page?: "home" | "project";
  project?: { name: string; url: string; description: string };
  contact: ContactForLd;
}) {
  const base = "https://absycode.com";
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AbsyCode",
    url: `${base}/${locale}`,
    email: contact.email,
    sameAs: [contact.instagram].filter(Boolean),
  };
  const svc = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AbsyCode",
    url: `${base}/${locale}`,
    areaServed: "EG",
    telephone: contact.phoneIntl,
    priceRange: "$$",
  };
  const data = page === "project" && project
    ? [{ ...svc, makesOffer: { "@type": "Offer", itemOffered: { "@type": "Service", name: project.name, url: project.url, description: project.description } } }, org]
    : [org, svc];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}