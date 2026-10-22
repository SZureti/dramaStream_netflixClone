import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";
import { json } from "./cors.ts";

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// Test-mode flat-rate monthly prices (tax_behavior: exclusive; Stripe Tax adds tax on top).
export const PRICE_BY_PLAN: Record<string, string> = {
  basic: "price_1UT2kr9OTvIXx9T4eAYsMWO9",
  standard: "price_1UT2kr9OTvIXx9T4r7EhPV2v",
  premium: "price_1UT2ks9OTvIXx9T4st5PxPw0",
};
export const planForPrice = (priceId?: string): string | null =>
  Object.entries(PRICE_BY_PLAN).find(([, id]) => id === priceId)?.[0] ?? null;

// Service-role client: bypasses RLS, so it never leaves the Edge Functions.
export const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

/** The signed-in user from the request's JWT, or a ready-made 401/500 response. */
export async function requireUser(req: Request): Promise<{ user: { id: string; email?: string } } | { response: Response }> {
  if (!Deno.env.get("STRIPE_SECRET_KEY")) return { response: json({ error: "Server is missing the STRIPE_SECRET_KEY secret." }, 500) };
  const token = req.headers.get("Authorization")?.replace(/^Bearer /i, "");
  const { data, error } = token ? await admin.auth.getUser(token) : { data: null, error: true };
  if (error || !data?.user) return { response: json({ error: "Sign in first." }, 401) };
  return { user: data.user };
}

/** Finds or creates the Stripe customer for a user, remembering it in public.subscriptions. */
export async function customerFor(user: { id: string; email?: string }): Promise<string> {
  const { data } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id;
  const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
  await admin.from("subscriptions").insert({ user_id: user.id, stripe_customer_id: customer.id });
  return customer.id;
}
