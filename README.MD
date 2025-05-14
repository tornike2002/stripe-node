# Stripe Integration API

A backend API for handling Stripe payments, subscriptions, and user authentication.

## Features

- User authentication (register/login)
- Course purchasing via Stripe Checkout
- Subscription management (monthly/yearly plans)
- Billing portal for customers
- Webhook handling for Stripe events
- Rate limiting for API endpoints

## Technologies

- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- Stripe API
- JWT for authentication
- Upstash Redis for rate limiting

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` (see Environment Variables below)
4. Run the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

MONGO_URL=mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_MONTHLY_PLAN_ID=your_monthly_plan_id
STRIPE_YEARLY_PLAN_ID=your_yearly_plan_id
FRONTEND_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
PORT=5000
