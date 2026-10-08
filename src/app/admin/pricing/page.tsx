import { getContent } from "@/lib/content";
import PricingEditor from "../PricingEditor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPricing() {
  const content = await getContent();
  return <PricingEditor initial={content.estimator} />;
}