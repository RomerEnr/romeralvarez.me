import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n";

export type Post = CollectionEntry<"blog">;

/** Entries live in <lang>/<slug>.md, so the id starts with the language. */
export const postLocale = (post: Post) => post.id.split("/")[0] as Locale;
export const postSlug = (post: Post) => post.id.split("/").slice(1).join("/");
export const postUrl = (post: Post) => `/${postLocale(post)}/blog/${postSlug(post)}/`;

export async function getPosts(locale: Locale) {
  const posts = await getCollection("blog", (p) => postLocale(p) === locale && !p.data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const formatDate = (date: Date, locale: Locale) =>
  date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
