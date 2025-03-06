import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createCheckoutSession(currency: string) {
  const yearlyPrice = Math.round(
    currency === "USD" ? 1200 : // $12.00
    currency === "EUR" ? 1104 : // €11.04
    currency === "GBP" ? 948 :  // £9.48
    currency === "JPY" ? 179400 : // ¥1,794
    currency === "AUD" ? 1836 : 1200 // A$18.36
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: "Travel Companion Premium Subscription",
            description: "1 Year Premium Access to Travel Companion",
          },
          unit_amount: yearlyPrice,
          recurring: {
            interval: "year",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.WEBSITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEBSITE_URL}/pricing`,
  });

  return session;
}
