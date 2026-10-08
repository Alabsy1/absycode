import { getContent } from "@/lib/content";
import ProjectsEditor from "../ProjectsEditor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminProjects() {
  const content = await getContent();
  return <ProjectsEditor initial={content.projects} />;
}