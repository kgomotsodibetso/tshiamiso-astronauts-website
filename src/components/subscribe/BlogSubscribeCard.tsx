import SubscribeForm from "./SubscribeForm";

// Sits after the last paragraph of a blog post, before the share links.
export default function BlogSubscribeCard() {
  return (
    <aside aria-labelledby="blog-subscribe-title" className="mt-12 rounded-2xl bg-brand-card p-6 sm:p-8">
      <h2 id="blog-subscribe-title" className="text-xl font-bold text-brand-navy">Stay in the loop.</h2>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-brand-navy">
        One short email a month with learner stories, events and ways to help.
      </p>
      <SubscribeForm variant="short" placement="blog-inline" />
    </aside>
  );
}
