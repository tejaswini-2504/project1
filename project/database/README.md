# LocalPro Database

## Location
`database/app.db` — SQLite database file

## Seed the Database

```bash
# From the project root:
cd backend
python ../database/seed.py
```

## Demo Credentials

| Role      | Email                  | Password    |
|-----------|------------------------|-------------|
| Admin     | admin@localpro.com     | admin123    |
| Customer  | customer1@demo.com     | customer123 |
| Customer  | customer2@demo.com     | customer123 |
| Customer  | customer3@demo.com     | customer123 |
| Provider  | provider1@demo.com     | provider123 |
| Provider  | provider2@demo.com     | provider123 |
| Provider  | provider3@demo.com     | provider123 |
| Provider  | provider4@demo.com     | provider123 |
| Provider  | provider5@demo.com     | provider123 |
| Provider  | provider6@demo.com     | provider123 |

## Schema
- **users** — all users (customer / provider / admin)
- **categories** — service categories (Home Repair, Food, etc.)
- **services** — individual services (Plumber, Electrician, etc.)
- **providers** — provider profiles linked to users
- **provider_services** — which services each provider offers
- **bookings** — service bookings with status workflow
- **payments** — mock payment records
- **invoices** — auto-generated invoices
- **reviews** — customer ratings and comments
- **addresses** — saved customer addresses
- **availability** — provider weekly schedule
- **notifications** — in-app notifications
- **ai_requests** — AI problem analysis log
- **messages** — booking chat messages
- **complaints** — complaint tickets
