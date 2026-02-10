// This route exists for backwards compatibility.
// The primary webhook handler is at /api/stripe/webhook
// which matches the URL configured in the Stripe Dashboard.
export { POST } from "@/app/api/stripe/webhook/route"
