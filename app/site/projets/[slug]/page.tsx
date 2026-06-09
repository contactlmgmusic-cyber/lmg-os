import { supabase } from "@/lib/supabase";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase
  .from("projets")
  .select("id, titre, slug")
  .eq("slug", slug);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <p>SLUG REÇU : {slug}</p>

      <pre className="mt-6 whitespace-pre-wrap text-sm">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}