import { corsHeaders, json } from "../_shared/cors.ts";
import { PRICE_BY_PLAN, customerFor, requireUser, stripe } from "../_shared/stripe.ts";

// POST {"plan": "basic" | "standard" | "premium", "returnUrl": "https://site/account"}
//   -> { "url": "https://checkout.stripe.com/..." }   (hosted Checkout, subscription mode)
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const auth = await requireUser(req);
  if ("response" in auth) return auth.response;

  let body: { plan?: string; returnUrl?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }
  const price = PRICE_BY_PLAN[body.plan ?? ""];
  if (!price) return json({ error: "Unknown plan." }, 400);

  let origin: string;
  try {
    origin = new URL(body.returnUrl ?? "").origin;
  } catch {
    return json({ error: "Missing returnUrl." }, 400);
  }

  try {
    const customer = await customerFor(auth.user);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: auth.user.id,
      line_items: [{ price, quantity: 1 }],
      automatic_tax: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      // Stripe emails a hosted invoice and PDF for every subscription charge.
      subscription_data: { metadata: { user_id: auth.user.id } },
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/account?checkout=cancelled`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Checkout session failed:", (err as Error).message);
    return json({ error: "Could not start checkout." }, 502);
  }
});
