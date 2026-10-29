import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts, postUrl } from "../lib/blog";

export async function GET(context: APIContext) {
  const posts = await getPosts("es");
  return rss({
    title: "Romer Alvarez · Blog",
    description: "Notas sobre Java, Kubernetes, cloud y sistemas distribuidos.",
    site: context.site!,
    customData: "<language>es</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
    })),
  });
}
