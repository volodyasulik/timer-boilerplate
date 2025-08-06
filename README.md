# Timer test task boilerplate

This is a boilerplate project for the timer test task. You can add any additional dependencies you need, including style libraries etc, but you should use [Fluent UI](https://github.com/microsoft/fluentui) for the UI and [Redux](https://redux.js.org/) for the state management.

Project structure is up to you.

## The task

Create an application to show timers - one local timer and some timers from the server.
There are "Timers" and "Settings" views.
Timers are shown as a table, values should change every second,
"Reset" button should drop value of its timer to zero.
Local timer is always shown, and it's value can be preserved between session,
if corresponding option is selected on "Settings" view.
As an extra option, implement showing the views as Tabs to switch between them.
Initial option to view as tabs or as all in one should be passed by page URL.

Use mockup.jpg as a reference, but it should not be precisely copied.

## Backend

To run the backend, use `docker run -p 7654:7654 -d strander/timer-api`. 
The backend will be available at `http://localhost:7654`.

### Endpoints

- `GET /<id>` - get the current timer value - returns json with `{ "start": <start timestamp relative to a reference timestamp (in seconds)>, "elapsed": <time elapsed since start (in seconds)> }`
- `POST /reset/<id>` - reset the timer, returns new timer value - returns json with `{ "start": <start timestamp relative to a reference timestamp (in seconds)>, "elapsed": <time elapsed since start (in seconds)> }`
- `GET /list` - get the list of all timers - returns json list if ids of all timers
