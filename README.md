# Blood Connect

React (Vite) client + Express/MongoDB API for connecting blood donors with people who need blood.

## Quick start

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run seed              # seed divisions/districts/upazilas (needed by the request form)
npm start                 # http://localhost:5000
```

`JWT_SECRET` is required and must be at least 32 characters. Keep `OTP_DEV_RETURN=true` in development so the verification code is returned in the API response and shown on screen.

### 2. Client

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

The client reads `VITE_API_URL` from `client/.env` (defaults to `http://localhost:5000/api/v1`).

## Connected features

| Page / action | Endpoint |
| --- | --- |
| Log in | `POST /auth/login` (cookie session) |
| Register + phone verification | `POST /auth/register`, `POST /auth/verification/request`, `POST /auth/verification/confirm` |
| Session restore / log out | `GET /auth/me`, `POST /auth/logout` |
| Forgot password | `POST /auth/password/forgot`, `POST /auth/password/reset` |
| Find donors + filters + pagination | `GET /donors/search`, `GET /locations` |
| Request a donor's contact | `POST /contact-requests` |
| Create a blood request (auth required) | `POST /blood-requests` |
| Home emergency feed | `GET /blood-requests/public` |
| Contact us | `POST /contact` |

All responses use `{ success, message, data }`; the client unwraps `data` automatically.

## Tangail location API

The location tree is **Tangail-only**: one division (Dhaka), one district (Tangail), all **12 upazilas** and their unions. No other divisions/districts are seeded. All donor, request and filter location pickers read from this API (no hardcoded lists).

```bash
cd server
npm run seed:tangail   # upserts Dhaka -> Tangail -> 12 upazilas -> unions
```

Endpoints:
- `GET /api/v1/locations` — flat active list; supports `?type=division|district|upazila|union` and `?parent=<id>`
- `GET /api/v1/locations/tree` — nested Tangail tree with upazilas and their unions
- `GET /api/v1/locations/:id` — single location
- `POST /api/v1/locations`, `PATCH /api/v1/locations/:id`, `DELETE /api/v1/locations/:id` — staff/admin

## Dashboards

After logging in, use the **Dashboard** link in the navbar (or go to `/dashboard`). The layout and navigation adapt to the signed-in role:

- **Donor** (`user`): profile & availability, my requests, matching requests with "I can help", donation history, notifications.
- **Volunteer** (`volunteer`): my assignments, verification queue (claim a submitted request before verifying it), volunteer profile, notifications.
- **Admin / Moderator** (`admin`, `moderator`): KPI overview, users & approvals, all requests, contact requests, campaigns, donations, audit log.

Routes are protected by `RequireAuth` / `RequireRole` on the client and by matching guards on the API. To test another role, an admin can change a user's role from **Dashboard → Users & approvals**. Admins can also edit a user's name/phone/email and **deactivate** accounts there — deactivation is a soft delete (the account is signed out and hidden from normal lists, but its history is preserved) and can't be applied to your own account.

## Account approval

Registration is deliberately account-first: the "Become a donor" page only collects name, phone, email and password, then verifies the phone with an OTP. Blood group, location and availability are added later from **Dashboard → My profile**, after the account is approved. This avoids collecting unused personal/health data and keeps the donor profile tied to a verified account.

New accounts are created with `accountStatus: pending` and cannot log in until a staff member approves them.

**Easiest (local development):**

```bash
cd server
npm run approve -- 01XXXXXXXXX    # approves the account registered with that phone
```

**Via the API (production path):** create an admin with `npm run seed:admin` (default `+8801700000000` / `Admin12345`), log in as the admin with `curl -c cookies.txt`, then:

```bash
curl -b cookies.txt -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"decision":"approve"}' \
  http://localhost:5000/api/v1/users/<USER_ID>/approval
```
