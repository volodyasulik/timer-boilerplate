Backend api consists of following endpoints:

- `GET /<id>` - get the current timer value - returns json with `{ "start": <start timestamp relative to a reference timestamp (in seconds)>, "elapsed": <time elapsed since start (in seconds)> }`
- `POST /reset/<id>` - reset the timer, returns new timer value - returns json with `{ "start": <start timestamp relative to a reference timestamp (in seconds)>, "elapsed": <time elapsed since start (in seconds)> }`
- `GET /list` - get the list of all timers - returns json list if ids of all timers
