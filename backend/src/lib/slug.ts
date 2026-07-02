export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(
  baseName: string,
  isSlugTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = slugify(baseName) || "category";
  let slug = baseSlug;
  let counter = 2;

  while (await isSlugTaken(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}
