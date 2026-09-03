# Nepal Youth Club website

This is the website and admin panel I built for Nepal Youth Club, a volleyball club in Perth, Australia.

The public pages show club events, players, match reports, and the current player of the month. People can also send a trial request through the site. The admin panel is used to manage the content and view new requests.

Live site: https://nepalyouthclub.onrender.com

## Built with

- Node.js and Express
- MongoDB and Mongoose
- JWT and bcrypt for the admin login
- Plain HTML, CSS, and JavaScript for the frontend
- EJS for the server-rendered pages
- Render for hosting

## Run it locally

```bash
git clone https://github.com/NathanGrg/Nepal-Youth-Club.git
cd Nepal-Youth-Club
npm install
npm run dev
```

The app runs on `http://localhost:5000` by default.

Create a `.env` file in the project root before starting the server:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_hashed_password
```

To generate a password hash:

```bash
npm run hash-password
```

## Main routes

Public API routes:

- `/api/events`
- `/api/players`
- `/api/trial-requests`
- `/api/match-reports`
- `/api/player-of-the-month`

Admin routes are under `/api/admin` and require a valid JWT. The admin page is available at `/admin.html`.

## Project folders

- `public/` contains the main frontend pages and assets.
- `src/routes/` contains the API and page routes.
- `src/models/` contains the MongoDB models.
- `src/views/` contains the EJS templates.
- `src/config/` contains the database setup.
- `tests/` contains the Jest and Supertest tests.

## Notes

Player photos currently use image URLs. Uploading images directly is something I may add later.

Author: [Nathan](https://github.com/NathanGrg)
