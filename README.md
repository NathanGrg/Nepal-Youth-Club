# Nepal Youth Club - Volleyball Club Website

A full-stack website built for Nepal Youth Club, a volleyball club based in Perth, Australia. Public visitors can view upcoming events, browse the player roster, and request a tryout. Club admins manage events and review tryout requests through a protected admin dashboard.

**Live site:** https://nepalyouthclub.onrender.com

## Features

- **Public site**: hero section, club stats, upcoming events, and a "Request a Trial" form for prospective players
- **Player roster**: dynamically rendered from the database
- **Admin dashboard** (`/admin.html`): JWT-protected panel to create/edit/delete events and review incoming trial requests, with live polling for new submissions
- **REST API** backing all dynamic content, built with Express and MongoDB

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt password hashing |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Hosting | Render |

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/events` | Public | List all events |
| POST | `/api/events` | Admin | Create an event |
| PUT | `/api/events/:id` | Admin | Update an event |
| DELETE | `/api/events/:id` | Admin | Delete an event |
| GET | `/api/players` | Public | List roster players |
| POST | `/api/players` | Admin | Add a player |
| PUT | `/api/players/:id` | Admin | Update a player |
| DELETE | `/api/players/:id` | Admin | Remove a player |
| POST | `/api/trial-requests` | Public | Submit a tryout request |
| GET | `/api/trial-requests` | Admin | View tryout requests |
| POST | `/api/auth/login` | Public | Admin login, returns a JWT |

## Project Structure

```text
├── config/db.js                # MongoDB connection
├── middleware/requireAdmin.js  # JWT auth guard for admin routes
├── models/                     # Mongoose schemas: Event, Player, TrialRequest
├── routes/                     # Express routers: event, players, trialRequests, auth
├── scripts/hashPassword.js     # CLI helper to generate the admin password hash
├── public/                     # Static frontend (index, players, admin pages + assets)
└── server.js                   # App entry point
```

## Running Locally

```bash
git clone https://github.com/NathanGrg/Nepal-Youth-Club.git
cd Nepal-Youth-Club
npm install
cp .env.example .env   # fill in your own values, see below
npm run dev            # starts on http://localhost:5000 with nodemon
```

### Environment Variables

Create a `.env` file (never commit this) with:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=generated_with_npm_run_hash-password
```

Generate `ADMIN_PASSWORD_HASH` by running:

```bash
npm run hash-password
```

## Roadmap

- [ ] Wire up the `/api/players` route in `server.js` (currently defined in `routes/players.js` but not yet mounted)
- [ ] Player management UI in the admin dashboard
- [ ] Image upload for player photos instead of manual URLs

## Author

Built by [Nathan](https://github.com/NathanGrg) as a freelance project for Nepal Youth Club.
