import { getContent } from "@/lib/content";
import TestimonialsEditor from "../TestimonialsEditor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminTestimonials() {
  const content = await getContent();
  return <TestimonialsEditor initial={content.testimonials} />;
}