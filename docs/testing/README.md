# Module 5 — RESTful API Test Evidence

Screenshots and results: **Module5-API-Test-Evidence.docx** (in this folder).

API tested with Postman against `http://localhost:3000`.
All data retrieved from the `travlr` MongoDB database through Mongoose.

## Tests performed

| # | Request | Expected | Actual result |
|---|---|---|---|
| 1 | `GET /api/trips` | 200, JSON array of all trips | **200 OK**, 2.09 KB, 3 trip documents returned |
| 2 | `GET /api/trips/GALR210214` | 200, JSON for one trip | **200 OK**, 843 B, Gale Reef document returned |
| 3 | `GET /api/trips/NOPE999` | 404 with error message | **404 Not Found**, 278 B, `{"message":"Trip NOPE999 not found"}` |

## Routes under test

| Method | URL | Controller | Mongoose call |
|---|---|---|---|
| GET | `/api/trips` | `tripsList` | `Model.find({})` |
| GET | `/api/trips/:tripCode` | `tripsFindByCode` | `Model.find({ code: req.params.tripCode })` |

Both controllers are in `app_api/controllers/trips.js`; routes are registered in
`app_api/routes/index.js` and mounted at `/api` in `app.js`.

## Express app consuming the API

`app_server/controllers/travel.js` no longer reads `data/trips.json` at request
time. It calls `http://localhost:3000/api/trips` with the Node `fetch` API and
renders the response. Loading `/travel` produces two entries in the server log —
`GET /api/trips 200` followed by `GET /travel 200` — confirming the page is
rendered from the database by way of the REST API.

`data/trips.json` remains in the project because `app_api/models/seed.js` uses it
to populate the database.

## Error handling

`find()` returns an empty array when nothing matches, and an empty array is
truthy in JavaScript, so the controllers test `q.length` rather than `!q`.
Without that check a bad trip code would return `200 []` instead of a 404.
Database and server failures are caught and returned as `500`.
