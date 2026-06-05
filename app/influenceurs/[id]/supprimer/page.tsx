import DeletePage from "@/components/DeletePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DeletePage
      table="influenceurs"
      id={id}
      title="Supprimer influenceur"
      redirectTo="/influenceurs"
    />
  );
}