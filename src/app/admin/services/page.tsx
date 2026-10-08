import { getContent } from "@/lib/content";
import ServicesEditor from "../ServicesEditor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminServices() {
  const content = await getContent();
  return <ServicesEditor initial={content.services} />;
}