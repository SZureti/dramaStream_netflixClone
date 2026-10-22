import { corsHeaders, json } from "../_shared/cors.ts";
import { admin, requireUser, stripe } from "../_shared/stripe.ts";

// POST {"returnUrl": "https://site/account"} -> { "url": "https://billing.stripe.com/..." }
// The Customer Portal lets members change plan, update their card, cancel, and see invoices.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  let returnUrl: string;
  try {
    returnUrl = new URL((await req.json())?.returnUrl).origin + "/account";
  } catch {
    return json({ error: "Missing returnUrl." }, 400);
  }

  const { data } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", auth.user.id).maybeSingle();
  if (!data?.stripe_customer_id) return json({ error: "No billing account yet. Subscribe first." }, 404);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: returnUrl,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Portal session failed:", (err as Error).message);
    return json({ error: "Could not open billing." }, 502);
  }
});
