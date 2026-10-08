import { getContent } from "@/lib/content";
import ContentEditor from "../ContentEditor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminContent() {
  const c = await getContent();
  return (
    <ContentEditor
      site={{
        tagline: c.tagline,
        heroSupport: c.heroSupport,
        location: c.location,
        founder: { quote: c.founder.quote, role: c.founder.role },
        ui: { ...c.ui },
        showTestimonials: c.showTestimonials,
      }}
      stats={c.stats}
      process={c.process}
      contact={c.contact}
    />
  );
}