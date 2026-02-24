const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// Replace with your actual Stripe Price ID for the Pro plan
const PRO_PLAN_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_mock_12345';

/**
 * Creates a Stripe Checkout Session for upgrading to the PRO plan.
 */
const createCheckoutSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user || user.role !== 'ISSUER') {
    return res.status(403).json({ error: 'Only Issuers can upgrade plans.' });
  }

  // Create or retrieve Stripe Customer
  let customerId = user.issuerDetails.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() }
    });
    customerId = customer.id;
    user.issuerDetails.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PRO_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      userId: user._id.toString()
    }
  });

  res.status(200).json({ sessionId: session.id, url: session.url });
});

/**
 * Stripe Webhook endpoint to handle asynchronous payment events.
 * Note: This endpoint must receive the raw body to verify signatures.
 */
const webhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful subscriptions
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Retrieve the user from metadata safely stored in session creation
    if (session.metadata?.userId) {
      await User.findByIdAndUpdate(session.metadata.userId, {
        'issuerDetails.plan': 'PRO',
        'issuerDetails.stripeSubscriptionId': session.subscription,
        'issuerDetails.subscriptionStatus': 'active'
      });
      console.log(`[Stripe Webhook] Upgraded user ${session.metadata.userId} to PRO plan.`);
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      const user = await User.findOne({ 'issuerDetails.stripeSubscriptionId': subscription.id });
      if (user) {
         user.issuerDetails.subscriptionStatus = subscription.status;
         // If they cancel or payment fails out, downgrade them back to STARTER
         if (subscription.status !== 'active' && subscription.status !== 'trialing') {
             user.issuerDetails.plan = 'STARTER';
         } else {
             user.issuerDetails.plan = 'PRO';
         }
         await user.save();
         console.log(`[Stripe Webhook] Updated subscription status for ${user._id} to ${subscription.status}`);
      }
  }

  res.status(200).json({ received: true });
});

module.exports = {
  createCheckoutSession,
  webhook
};
