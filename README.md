# Medbook Software Developer Practical Assessment


## The Solution

### How The Queue Works

Every waiting customer is given a priority: **Emergency**, **Priority**, or **Normal**. But the longer the customer waits, the more urgent their situation is treated thus their priority escalates to the next level giving them an **effective priority**. For example, a **Normal** customer who has waited 90 minutes or more is escalated to an **Emergency** effective priority. A **Normal** customer who has waited between 60 and 90 minutes is assigned a **Priority** effective priority. A **Priority** customer who has waited for 45 minutes or more is assigned an **Emergency** effective priority. This effective priority is recalculated every time the queue is viewed from the original arrival timestamp and is never stored, so it's always accurate for the exact moment you're looking at it.

Within each priority level, whoever arrived earliest is served first. If two people arrived at exactly the same moment, whoever was added to the system first takes precedence.

Only customers who are actively waiting appear in the queue. Someone who has already been served, or has been cancelled, drops out automatically.

From the queue a staff member can change a customer's status from **Waiting** to one of three options; **Being Served**, **Completed** and **Cancelled**. Only one customer can be served at a time. From the **Being Served** status, a customer can only move to **Waiting** or **Completed** status. **Completed** and **Cancelled** statuses are final, a customer cannot change from them.


### Application Setup

The backend of the application is built on **PHP8.3.33, Composer Version 2.8.6, MySQL**

The frontend of the application is built on **React; npm version 10.9.8**. I chose React over the preferred Angular since it's my primary stack

To setup the application;
 - Clone the application repository from Github and cd into it

#### Backend Setup
 - From your terminal run 'cd medbook-backend'
 - Run 'composer install'
 - Run 'cp .env.example .env'
 - Run 'php artisan key:generate'
 - Edit .env with your MySQL credentials:
    
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=medbook1
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    APP_TIMEZONE=Africa/Nairobi

- Replace "your_username" and "your_password" with your username and password
- Create the database, then run migrations and seed the assessment scenario
    - php artisan migrate --seed
    - php artisan serve

The API will be available at http://127.0.0.1:8000/api (or 8001 if 8000 is already in use. Check the terminal output).

#### Frontend Setup
 - From your terminal, run 'cd medbook-frontend'
 - Run 'npm install'
 - Run 'npm run dev'

Open the printed local URL (typically http://localhost:5173).
If the frontend's API base URL doesn't match the port your backend printed, update it in src/api/client.js.

#### Running the automated tests
 - From your terminal run, 'cd backend'
 - Run 'php artisan test'

#### Verifying the assessment scenario
The seeder creates the five customers from the brief (Peter, Mary, John, Susan, Daniel) with their original arrival times. To view the queue exactly as it stood at 11:15 AM on the seeded date which is the current date the data was seeded. Run this from Postman;
- GET - `http://127.0.0.1:8000/api/customers/queue?as_of=<seed-date> 11:15:00`
 (Replace `<seed-date>` with today's date in YYYY-MM-DD format (the same day you ran php artisan migrate --seed).)


## Main Technical Decisions

**Effective priority is never stored.** Only *original_priority* is saved to the database. Effective priority is calculated on every request from *original_priority*, *arrived_at*, and the point in time being assessed. This guarantees the value is always correct and removes any risk of it drifting out of sync.

***arrived_at* is stored separately from *created_at***. *arrived_at* is the customer's real original arrival time and is set once, never modified. This is what waiting time and escalation are calculated from, and it means the clock correctly doesn't reset if a customer moves from Being Served back to Waiting. *created_at* is Laravel's own record-insertion timestamp, used only as the final tie-break when two customers have identical arrival times.

**The queue calculation accepts an explicit point in time (*$asOf*)**, defaulting to the current moment if none is given. This is what allows the assessment scenario to be tested deterministically against a fixed point in time, rather than only ever being checkable against "right now."

**Queue logic lives in a dedicated service class (*QueueService*)**, separate from the controller. This keeps the business rules testable in isolation, without needing to go through HTTP requests to verify them. This is visible directly in the automated tests, which call the service class methods directly.

**Status transitions are validated against an explicit allow-list (*Waiting → Being Served/Cancelled, Being Served → Completed/Waiting, etc.*)** rather than open-ended status updates, so an invalid transition is rejected with a clear message rather than being silently accepted.

**The one-being-served rule is enforced at the point of the status update**, checking for any other customer currently *Being Served* before allowing a new one. This is enforced in application code; see "**Production improvements**" for how this would be hardened against simultaneous requests

**The seeded scenario uses the current date rather than a fixed historical one**. A fixed historical date makes the exact scenario numbers permanently reproducible, but would leave real waiting times with nonsensical values (thousands of minutes) once the seed date is in the past. Using *today()* keeps the seeded data meaningfully "live", at the cost of the reviewer needing to substitute today's date when checking the scenario against *?as_of=*.


## Edge Cases Considered

**Signed time differences (Carbon 3)**. Laravel 11 ships with Carbon 3, where *diffInMinutes()* returns a signed value by default rather than always positive. This meant waiting times were initially calculated as negative numbers, and was silently breaking escalation, since a negative minute count could never cross a positive threshold like 45 or 60. This was fixed by passing *absolute: true* explicitly wherever the diff is calculated.

**Missing application timezone**. With no *APP_TIMEZONE* set, Laravel defaulted to UTC while the seeded arrival times assumed local (East Africa Time, UTC+3). This caused the current time and the seeded arrival times to be compared against different effective clocks, producing scrambled queue ordering rather than a simple constant offset. This was fixed by explicitly setting *APP_TIMEZONE=Africa/Nairobi*. Doing this also uncovered that *config/app.php* had *timezone* hardcoded rather than reading from *.env*, which needed correcting separately.

**Future arrival timestamps**. Nothing initially stopped a customer being created with an arrival time in the future, which when combined with the earlier signed time differences fix, it meant a customer who hadn't "arrived" yet could still display a valid-looking positive wait time. This was fixed by adding a *before_or_equal:now* validation rule, so the API rejects any arrival time later than the current server time.

**Empty queue**. When no customers are waiting, *next()* returns null rather than throwing an error, and the frontend displays "No customers waiting" instead of crashing on an undefined value.


## Testing The Solution

**Manual verification against the known scenario**. Before writing any API endpoints, the queue engine was tested in isolation using `php artisan tinker`. This was carried out by directly creating the five customers from the brief's scenario (Peter, Mary, John, Susan, Daniel), and QueueService::getQueue() was run against a fixed 11:15 AM timestamp. The output was checked against the exact expected order (Peter → Susan → Mary → John → Daniel, Peter served next) before any HTTP layer was built, so the core business logic was confirmed correct before adding integration complexity on top of it.

**API endpoints tested via Postman**. Each endpoint was manually tested for both its success and failure paths; valid customer creation, invalid input producing a 422, valid and invalid status transitions, and the one-being-served conflict producing a 409. This was done before the frontend was connected.

**Automated tests**. Five focused tests cover the business rules most central to the brief:

 - Two boundary tests confirming Normal escalates to Priority at exactly 60 minutes, and not at 59 (*QueueServiceTest*)
 - A tie-break test confirming two Emergency customers are ordered by arrival time, not creation order (*QueueServiceTest*)
 - An invalid-transition test confirming a Completed customer cannot move back to Waiting (*CustomerStatusTest*)
 - A concurrency-rule test confirming a second customer cannot be set to Being Served while another already is (*CustomerStatusTest*)

These tests were run with `php artisan test` from inside the medbook-backend folder.

**End-to-end manual testing through the UI**. After the frontend was built, the full flow was re-tested manually simulating real world use: adding a customer, watching them appear correctly ordered in the queue, moving them through Being Served to Completed, and confirming the "currently serving" and "next up" sections update correctly after each transition.


## Limitations / Incomplete Work

**Concurrency protection is incomplete**. The one-being-served check in *updateStatus()* queries for an existing "Being Served" customer before allowing a new one, using *lockForUpdate()*, but this isn't wrapped in a database transaction. A row lock only prevents a race condition if it's held for the full duration of the check-and-update. In the project's current state, two simultaneous requests could still both pass the check before either writes. See "Production improvements" for how this would be properly closed.

**No visibility into a customer once they've been marked Cancelled or Completed**. The frontend only shows Waiting customers (the queue table) and the one customer currently Being Served. There's no view of completed or cancelled history. This wasn't required by the brief but would likely be needed in a real deployment.

**The seeded scenario depends on the day it's run**. Because the seeder uses the current date rather than a fixed one (see "Technical decisions" for the reasoning), verifying the exact brief scenario requires substituting today's date into the *as_of* query parameter. This produces a minor manual step for whoever is reviewing this.

**No pagination or search on the queue**. With a handful of customers this isn't noticeable, but a queue table returning every Waiting customer with no limit would not scale to a busy service centre.

**Minimal frontend validation**. Field validation (e.g. required fields, priority selection) is enforced by the backend and by basic *HTML required attributes*, but there's no inline client-side feedback beyond the browser's default. However, errors from the API are shown, but not proactively before submission.


## Production Improvements

**Properly close the one-being-served race condition**. The current check-then-update in *updateStatus()* isn't atomic. In production, I'd wrap it in a database transaction with the row lock held for the full operation:


            DB::transaction(function () use ($customer, $newStatus) {
                $alreadyServing = Customer::where('status', 'Being Served')
                    ->where('id', '!=', $customer->id)
                    ->lockForUpdate()
                    ->exists();

                if ($alreadyServing) {
                    throw new ConflictException('Another customer is already being served.');
                }

                $customer->update(['status' => 'Being Served']);
            });

This ensures the lock is held from the moment the check begins until the write completes, so two simultaneous requests can no longer both pass the check before either commits. An alternative approach would be a unique partial index at the database level (e.g. a constraint allowing at most one row where `status = 'Being Served'`), which would enforce the rule even against a bug in application code

**Authentication and authorization**. Explicitly out of scope per the brief, but any real deployment would need staff accounts and access control before this could be used with real customer data.

**Audit trail**. Status changes currently overwrite the customer's row with no history. A system in production would benefit from logging each transition (who changed it, when, from what to what) both for accountability and for investigating disputes.

**Structured error handling**. Error responses are currently built inline in the controller. A larger system would benefit from custom exception classes and a centralized exception handler, so error formatting stays consistent as more endpoints are added.

**Real-time updates**. The frontend currently polls by refetching after every action. A busier service centre with multiple staff members on different devices would benefit from WebSockets or polling on an interval, so one staff member's changes are reflected on another's screen without a manual refresh.


## Mobile Development Experience

I have minimal hands-on experience with mobile development specifically. My background is primarily in web development (the stack used in this assessment), and I haven't built a production mobile application before.

If the need arose, I'd approach it the same way I approach any new stack: start with the official documentation for whichever framework the team uses (e.g. React Native, given the overlap with React on the frontend here, or Flutter if the team prefers it), build a small throwaway project to get the fundamentals such as  navigation, state management, and the platform-specific quirks under my belt, then pair closely with someone experienced on the team for the first real feature to catch conventions and gotchas early rather than learning them the hard way in review. Given how much of the underlying logic here (state, API calls, forms, conditional rendering) carries over from React, I'd expect the ramp-up to be more about platform specifics than fundamentally new concepts.


## AI Use

**Claude (Anthropic)**. This was used throughout the build as a guided mentor rather than a code generator. I worked through each phase step by step: it walked me through commands and explained design decisions (e.g. why *effective_priority* shouldn't be stored, why *arrived_at* and *created_at* need to stay separate), and I wrote, ran, and debugged the code myself against real output at each step. It was also used to help debug several environment and library issues encountered during development (a Carbon 3 signed time differences behaviour change, a missing/hardcoded application timezone, and missing PHP SQLite extensions), and to help structure and draft this README from the actual decisions and issues encountered during the build.

I understand every part of the submitted solution and can explain, troubleshoot, or modify any of it. This was a deliberate way of working through the assessment, not a shortcut around it.