This is the project repository submitted for the Medbook Practical Assessment Stage for the Software Developer position.

The frontend is found in /medbook-frontend built on React.
The backend is found in /medbook-backend built on PHP.

A couple of things worth flagging for your README's "how would you protect this under concurrent requests" section (the brief explicitly asks):

lockForUpdate() takes a row-level lock, but it only actually prevents a race if it's inside a transaction — right now it isn't wrapping this whole method in DB::transaction(). That's a legitimate gap to name honestly in the README as "what I'd improve for production" rather than pretend is airtight. A fully safe version wraps the check-and-update in DB::transaction(fn () => ...) so the lock is held for the full read-then-write.
I used a plain if/422/409 split rather than exceptions — either is fine; explain whichever you keep.

Customer Seeder seeds sample data into db
seed command; php artisan migrate:fresh --seed

A design point worth noting for your README: refreshQueue() is called after every mutation rather than trying to update local state optimistically. Since effective_priority and waiting_minutes are always server-calculated (never trusted client-side), re-fetching is the only correct way to keep the displayed queue accurate — an optimistic update would have to reimplement the escalation logic in JavaScript, which risks drifting out of sync with the backend.

Two things worth knowing about this:

type="datetime-local" gives you a native browser date/time picker with no extra library. Its output format is YYYY-MM-DDTHH:mm (e.g. 2026-08-21T10:00) — Laravel's date validation rule and Carbon both parse this fine, so no conversion needed before sending it to the API.
The form doesn't call the API directly — it just calls onSubmit(formData), which App.jsx owns. That keeps this component "dumb" (just UI + local input state), while all the actual API/error-handling logic stays centralized in one place — useful to point out in the live session as a deliberate separation of concerns.

initially the UI had no way to view or act on a customer once served, since the queue only lists Waiting customers by design; added a dedicated endpoint and section for the currently-served customer