export const careersRoutes = {
  home: "/careers",
  jobs: "/careers/jobs",
  spontaneous: "/careers/spontaneous",
  faq: "/careers/faq",
  privacy: "/careers/privacy",

  job: (slug: string) =>
    `/careers/jobs/${slug}`,

  apply: (slug: string) =>
    `/careers/apply?job=${encodeURIComponent(slug)}`,
};
