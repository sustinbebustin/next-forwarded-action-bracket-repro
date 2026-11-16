# Forwarded Server Action uses an unencoded route pattern

A Server Action posted to a page that does not own it is forwarded by Next.js
over HTTP to the page that does. The forwarded URL is built from the owning
page's route **pattern**, so for a dynamic route it carries literal brackets:
`POST /items/[id]/edit`. An HTTP front end that rejects an unencoded `[` or `]`
in a path stops that request. An AWS Lambda function URL is one: it answers
`400 Bad Request` without invoking the function. Next.js then answers the
browser `200 application/json {}` with nothing logged, the client throws
`An unexpected response was received from the server.`, and the action never
runs.

## The app

- `app/items/[id]/edit` renders a client `Editor` that calls the `saveDraft`
  Server Action when it unmounts.
- `app/items/[id]` shows the saved draft. It does not import the action.
- `strict-server.mjs` serves the production build behind a check that answers
  400 to any path with a literal `[` or `]`, as a Lambda function URL does.

## Reproduce

```sh
pnpm install
pnpm build
pnpm start:strict        # http://localhost:3000, or set PORT
```

### With curl

```sh
AID=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('.next/server/server-reference-manifest.json','utf8')).node)[0])")

# Control: post the action to the page that owns it.
curl -si http://localhost:3000/items/1/edit \
  -H 'content-type: text/plain;charset=UTF-8' -H "next-action: $AID" \
  --data-raw '["1","hello"]'
# HTTP 200, content-type: text/x-component, body ends with 1:{"saved":true}

# Bug: post the same action to the page that does not own it.
curl -si http://localhost:3000/items/1 \
  -H 'content-type: text/plain;charset=UTF-8' -H "next-action: $AID" \
  --data-raw '["1","hello"]'
# HTTP 200, content-type: application/json; charset=utf-8, body: {}
```

The server prints the request Next.js made to itself:

```
front door: 400 POST /items/[id]/edit
```

### In a browser

1. Open <http://localhost:3000/items/1/edit> and type in the textarea.
2. Click "Back to item". The editor unmounts and calls `saveDraft`, which the
   router posts to `/items/1`.
3. The console shows
   `saveDraft rejected: An unexpected response was received from the server.`
4. Reload `/items/1`: what you typed is not there.

### Control

`pnpm start` (plain `next start`, no bracket check) passes both curl calls and
the browser steps, because the Node HTTP server accepts the bracketed path.

## Why a custom server

Under `next start` the forward goes to `http://localhost:PORT`, straight back
into Node, so nothing objects to the brackets. On a host with no local
listener the forward goes to the public origin instead. With OpenNext on AWS
Lambda that is CloudFront and then the function URL, and the function URL
refuses the path. `strict-server.mjs` puts that one rule in front of the same
production build so the failure shows locally.

## Cause

`createForwardedActionResponse` in
`packages/next/src/server/app-render/action-handler.ts`:

```js
const fetchUrl = new URL(`${origin}${basePath}${workerPathname}`)
```

`workerPathname` is the owning page's route pattern (`/items/[id]/edit`), and
the WHATWG `URL` parser leaves `[` and `]` in a path as they are, although
RFC 3986 does not allow them there unencoded. Wrapping it in
`encodeURI(workerPathname)` sends `/items/%5Bid%5D/edit`, which the front end
accepts and the router matches; with that change the calls above succeed
against `pnpm start:strict`.
