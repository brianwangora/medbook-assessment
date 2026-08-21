This is the project repository submitted for the Medbook Practical Assessment Stage for the Software Developer position.

The frontend is found in /medbook-frontend built on React.
The backend is found in /medbook-backend built on PHP.

A couple of things worth flagging for your README's "how would you protect this under concurrent requests" section (the brief explicitly asks):

lockForUpdate() takes a row-level lock, but it only actually prevents a race if it's inside a transaction — right now it isn't wrapping this whole method in DB::transaction(). That's a legitimate gap to name honestly in the README as "what I'd improve for production" rather than pretend is airtight. A fully safe version wraps the check-and-update in DB::transaction(fn () => ...) so the lock is held for the full read-then-write.
I used a plain if/422/409 split rather than exceptions — either is fine; explain whichever you keep.