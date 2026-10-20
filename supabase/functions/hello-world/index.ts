import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return json({ message: "Hello World" });
});
