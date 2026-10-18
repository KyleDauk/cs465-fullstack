# Travlr Getaways — Full Stack MEAN Application

A travel booking platform built for CS 465 Full Stack Development I, serving two
distinct audiences from one shared data layer: a server-rendered public site where
customers browse and search travel packages, and an Angular single-page application
where staff manage the trip catalog behind token-based authentication.

**Author:** Kyle Dauk
**Course:** CS 465 Full Stack Development I, Southern New Hampshire University

---

## Stack

| Tier | Technology |
|---|---|
| Database | MongoDB with Mongoose ODM |
| Server | Node.js, Express |
| Public front end | Express MVC with Handlebars (HBS) templating |
| Admin front end | Angular single-page application |
| Authentication | Passport local strategy, JSON Web Tokens, PBKDF2-SHA512 |
| Testing | Postman for API endpoints, Vitest with jsdom for the SPA |

## Repository layout

```
app_api/          RESTful API — models, controllers, routes, Passport config
app_admin/        Angular single-page application (admin)
app_server/       Express MVC for the public site — routes, controllers, views
public/           Static assets for the public site
data/             Seed data for the trips collection
app.js            Express application entry point
```

Branches `module1` through `module7` preserve the state of the application at each
stage of development, with `module7` holding the completed project including the
security layer.

## Running locally

A running MongoDB instance is required. From the project root:

```bash
npm install
npm start
```

The API and public site are served by Express. The project includes a `.env` file
holding `JWT_SECRET`, which the API reads at startup to sign and verify tokens.

For the admin application:

```bash
cd app_admin
npm install
npm start
```

The Angular development server runs on its default port and communicates with the
Express API over the RESTful endpoints in `app_api/routes`.

To run the automated SPA tests:

```bash
cd app_admin
npm test
```

---

# Journal Reflection

## Architecture

The two front ends in this project solve different problems and are built
differently as a result. The public customer-facing site is a server-rendered
Express application following the Model-View-Controller pattern. A request arrives
at the Express server, is matched to a route, and is handed to a controller that
assembles the data and passes it to a Handlebars view, which is compiled into
finished HTML on the server before it reaches the browser. Handlebars partials hold
the markup shared across pages — the header, the footer, the navigation — so those
elements are defined once instead of repeated in every file. The earliest version of
this site was plain static HTML with hardcoded trip data, and moving it to templates
fed by JSON was the first real refactor of the project.

The administrative side is an Angular single-page application. Rather than the
server sending a new page for every action, the application's components,
templates, and routing are delivered to the browser once and run there, and
subsequent operations exchange only data with the API. That produces the richer
interaction an internal tool needs: an administrator editing a trip sees validation
and updates without a page reload, and long working sessions stay responsive
because the shell never reloads.

Choosing between them comes down to who is looking. The public pages must load fast
on first visit and must be readable by search engine crawlers and social sharing
previews, because customers find travel packages through search — that is a
commercial requirement, not a technical preference, and server-side rendering
handles it natively. The admin tool has no search visibility requirement at all, so
the single-page approach costs nothing and buys a much better interface. Plain
client-side JavaScript sits between the two: enough for small interactions on the
public pages, but with no structure for state, routing, or component reuse, which is
precisely what Angular supplies.

The backend uses MongoDB because the data and the application speak the same
language. MongoDB stores documents as binary JSON, so a trip in the database has
essentially the same shape as the object the controller works with and the object
the Angular client receives, with no translation between a relational schema and
application objects. A trip is naturally a self-contained document rather than
something spread across joined tables, and the flexible schema meant adding fields
as requirements grew did not require a migration. Mongoose sits on top and supplies
the structure a schemaless database otherwise lacks, defining the fields, types, and
validation for each collection and exposing documents to Node as plain JavaScript
objects.

## Functionality

JSON and JavaScript are related but not the same thing. JSON is a text format for
representing data, derived from JavaScript's object literal syntax but far more
restricted: keys must be double-quoted strings, the only values permitted are
strings, numbers, booleans, null, arrays, and objects, and there is no place for a
function, a comment, or an expression. JavaScript is a programming language. The
distinction matters because JSON being only data is exactly what makes it portable —
it is language-independent, which is why it works as a contract between systems that
share no code.

In this project JSON is the connective tissue across every tier. MongoDB stores
documents as BSON, Mongoose hands them to the Express controllers as JavaScript
objects, `res.json()` serializes them to JSON text over HTTP, and Angular's
`HttpClient` parses them back into typed objects on the client. The same trip
structure travels from the database to the browser without being reshaped at any
boundary. The seed data for the trips collection is a JSON file, and the JWT issued
at login is itself a signed JSON payload.

Several refactors in this project improved the application rather than just moving
code around. The static HTML pages became Handlebars templates rendering JSON, which
removed duplicated markup and let one view serve many trips. Hardcoded trip data
became a JSON file, then a seeded MongoDB collection, then API calls — each step
removing a place where the same information was stored twice. Putting a RESTful API
between the application and the database, instead of querying MongoDB directly from
the public controllers, meant the public site, the admin SPA, and any future client
could be served by one set of endpoints without duplicating query logic. In the
Angular application, browser storage was moved behind an injection token rather than
calling `localStorage` directly, which decoupled the authentication service from the
browser and made it testable. Two defects found during the API work were corrected
as part of this: an update endpoint that returned the pre-update document, and one
that returned the wrong status code. Instructor feedback drove another, replacing raw
database errors in API responses with sanitized messages, so a duplicate registration
now returns a plain explanation while the real error is logged server-side.

Reusable UI components earn their keep in a few ways at once. The trip card is
defined once and rendered for every trip in the listing, so the cards cannot drift
out of alignment with each other. A change to the card's layout happens in one file
and appears everywhere. A bug fixed in the card is fixed in every place it appears.
And because a component is a self-contained unit with declared inputs, it can be
tested on its own — the card's spec file sets an input and asserts on what renders,
with no server and no database involved.

## Testing

A full stack application is held together by endpoints, and an endpoint is the
pairing of a URL with an HTTP method. The method carries the intent. In this project
`GET /api/trips` retrieves the collection, `POST /api/trips` creates a trip,
`PUT /api/trips/:tripCode` updates one, and `DELETE /api/trips/:tripCode` removes
one — the four verbs mapping onto the four CRUD operations. The same URL behaves
differently depending on the method it receives, which is why testing has to cover
method and path together rather than just hitting a URL and seeing what comes back.
Each one also has a contract beyond its payload: a successful creation returns 201, a
successful update returns 200, a request for something that does not exist returns
404, and a request without a valid credential returns 401.

I tested these two ways. Postman exercised each endpoint directly, which is how I
verified the new user-class endpoints and confirmed that registration stores a hash
rather than a password, that login returns a token, and that the protected methods
reject requests without one. Automated tests in the Angular application covered the
client side, using Angular's HTTP testing controller to intercept requests so the
service logic could be verified against known responses without a live server.

Security makes all of this harder in a specific way. Before authentication, a test
could call an endpoint and assert on the response. Afterward, every protected route
needs a valid credential before it will answer at all, so the tests had to construct
a token rather than simply sending data. Tokens expire, which makes anything baked
into a fixture time-sensitive and liable to go stale. The interceptor that attaches
the token to outgoing requests means the client-side assertions have to account for
an Authorization header that was not previously there. The tension is structural:
security exists to make a system difficult to access, and an automated test is a
program trying to access it, so every control added becomes something the test
harness has to satisfy legitimately. The tempting shortcut — disabling
authentication in test mode — is exactly the one that leaves the security path
itself untested, which is the part most worth testing.

It is also worth being clear about what one layer does and does not buy. Protecting
the write methods with JWTs means nobody can alter the trip catalog without logging
in, and hashing with PBKDF2 and a per-user salt means a stolen database yields no
passwords. But a valid token is all-or-nothing access, there are no roles, nothing
rate-limits the login route, a token cannot be revoked before it expires, and
without transport security the token travels in the clear. Defense in depth would
layer role-based permissions, rate limiting, short-lived tokens with refresh and
revocation, and HTTPS on top of what is here.

## Reflection

The most valuable thing this course gave me was seeing one application through every
tier instead of studying the tiers separately. Building the database, the API, the
server-rendered site, and the single-page application as parts of a single system
made the trade-offs between them concrete in a way that reading about them does not.
I now understand why a public page is rendered on the server and an internal tool is
not, why an API belongs between the application and the database even when there is
only one consumer today, and what it actually costs to add authentication to
something that was built without it.

The reading on JavaScript full stack development framed something I experienced
directly: using one language across every tier removed a whole category of
integration work, since the same object moved from MongoDB through Express to Angular
without being translated at any boundary. The article is also honest about the
limits — Node's single-threaded model is a poor fit for CPU-heavy work, and the
JavaScript ecosystem moves fast enough that tooling churns under you. I ran into the
second one firsthand: the course guide targets an older Angular version, and the
version I built on had moved to signals and a new control flow syntax, so I had to
understand what the guide was accomplishing rather than copy it, and verify the
result myself.

Concretely, I can now design a REST API and reason about status codes and method
semantics, model data in MongoDB with Mongoose, build an Angular application with
components and services and dependency injection, implement token authentication with
hashed credentials, write automated tests for a secured client, and use Git branching
to keep a project's history legible stage by stage. The habit I value most is the
debugging discipline: verifying a claim against the running system instead of
trusting that code does what it looks like it does. More than once this term the
obvious explanation for a failure was wrong, and the only way through was to test the
assumption directly. That transfers to any stack.
