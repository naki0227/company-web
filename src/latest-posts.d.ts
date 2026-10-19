declare module "virtual:latest-posts" {
  const posts: { slug: string; title: string; date: string }[];
  export default posts;
}
