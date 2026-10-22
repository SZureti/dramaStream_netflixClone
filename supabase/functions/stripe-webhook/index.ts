import Stripe from "npm:stripe@17";
import { admin, planForPrice } from "../_shared/stripe.ts";

// Stripe -> POST /functions/v1/stripe-webhook
// Needs the STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET secrets. Stripe sends no JWT,
// so config.toml sets verify_jwt = false; the signature check below is the auth.
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Mirrors a Stripe subscription into public.subscriptions (keyed by the customer saved at checkout).
async function syncSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const { error } = await admin
    .from("subscriptions")
    .update({
      stripe_subscription_id: sub.id,
      plan: planForPrice(item?.price.id),
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
      current_period_end: (item?.current_period_end ?? (sub as any).current_period_end) ? new Date((item?.current_period_end ?? (sub as any).current_period_end) * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", String(sub.customer));
  if (error) throw new Error(error.message);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret || !Deno.env.get("STRIPE_SECRET_KEY")) {
    return reply({ error: "Server is missing Stripe secrets." }, 500);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return reply({ error: "Missing stripe-signature header." }, 400);

  // The raw body is required for signature verification; do not parse it first.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return reply({ error: "Invalid signature." }, 400);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${inv.id} (customer ${inv.customer})`);
        break; // Smart Retries and Stripe's dunning emails handle recovery; status arrives via subscription.updated.
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Handling ${event.type} failed:`, (err as Error).message);
    return reply({ error: "Handler failed." }, 500); // Stripe retries on non-2xx.
  }

  return reply({ received: true });
});
