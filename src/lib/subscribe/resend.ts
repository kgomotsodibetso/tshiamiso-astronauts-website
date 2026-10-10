import { Resend } from "resend";
import { AUDIENCES, RESEND, TOPICS, TOPIC_KEYS, type AudienceKey, type SubscribeVariant, type TopicKey } from "@/config/subscribe";

// The subscribe routes use their own full-access key (contacts, segments, events). The contact
// form keeps using RESEND_API_KEY, which is left alone.
let client: Resend | null = null;
function resend(): Resend {
  const key = process.env.RESEND_SUBSCRIBE_API_KEY;
  if (!key) throw new Error("RESEND_SUBSCRIBE_API_KEY is not set");
  return (client ??= new Resend(key));
}

export async function sendConfirmationEmail(to: string, firstName: string, confirmUrl: string): Promise<void> {
  const { error } = await resend().emails.send({
    to,
    template: {
      id: RESEND.confirmTemplateId,
      variables: { GIVEN_NAME: firstName, CONFIRM_URL: confirmUrl },
    },
  });
  if (error) throw new Error(`confirmation email failed: ${error.name}`);
}

export interface ResendOutcome {
  /** The contact did not exist, or had unsubscribed. The welcome email should go out. */
  sendWelcome: boolean;
  created: boolean;
}

interface SignupData {
  email: string;
  firstName: string;
  audience: AudienceKey;
  topics: TopicKey[];
  variant: SubscribeVariant;
}

const allTopics = (ticked: TopicKey[]) =>
  TOPIC_KEYS.map((k) => ({
    id: TOPICS[k].resendTopicId,
    subscription: ticked.includes(k) ? ("opt_in" as const) : ("opt_out" as const),
  }));

/**
 * Create or update the Resend contact. Idempotent: the contact is looked up first.
 * New or previously-unsubscribed contacts get all four topics set (ticked = opt in, rest = opt out).
 * Contacts who are already subscribed only get the topics they ticked opted in; nothing is removed.
 */
export async function upsertContact(s: SignupData): Promise<ResendOutcome> {
  const r = resend();
  const segmentId = AUDIENCES[s.audience].resendSegmentId;

  const found = await r.contacts.get({ email: s.email });
  if (found.error && found.error.name !== "not_found") throw new Error(`contact lookup failed: ${found.error.name}`);

  if (!found.data) {
    const created = await r.contacts.create({
      email: s.email,
      firstName: s.firstName,
      unsubscribed: false,
      segments: [{ id: segmentId }],
      topics: allTopics(s.topics),
    });
    if (created.error) {
      // Two clicks at once: the other request won the race. Treat as already there.
      if (/exist/i.test(created.error.message ?? "")) return { sendWelcome: false, created: false };
      throw new Error(`contact create failed: ${created.error.name}`);
    }
    return { sendWelcome: true, created: true };
  }

  const wasUnsubscribed = found.data.unsubscribed === true;
  const upd = await r.contacts.update({ email: s.email, firstName: s.firstName, unsubscribed: false });
  if (upd.error) throw new Error(`contact update failed: ${upd.error.name}`);

  const topicsRes = await r.contacts.topics.update({
    email: s.email,
    topics: wasUnsubscribed
      ? allTopics(s.topics)
      : s.topics.map((k) => ({ id: TOPICS[k].resendTopicId, subscription: "opt_in" as const })),
  });
  if (topicsRes.error) throw new Error(`contact topics failed: ${topicsRes.error.name}`);

  const seg = await r.contacts.segments.add({ email: s.email, segmentId });
  if (seg.error) throw new Error(`contact segment failed: ${seg.error.name}`);

  return { sendWelcome: wasUnsubscribed, created: false };
}

export async function fireWelcomeEvent(email: string, variant: SubscribeVariant): Promise<void> {
  const { error } = await resend().events.send({
    event: variant === "full" ? RESEND.eventFull : RESEND.eventNewsletterOnly,
    email,
  });
  if (error) throw new Error(`welcome event failed: ${error.name}`);
}
