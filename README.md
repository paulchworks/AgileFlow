# Agileflow

<img width="1897" height="882" alt="image" src="https://github.com/user-attachments/assets/8ade3099-f04e-4268-9044-d1c16ffe001c" />


## Running the app locally for development

```bash
npm install
npm install @hello-pangea/dnd
npm run dev
```

## Building the app

```bash
npm run build
```

# End‑to‑End Deployment Guide (AWS)

This section walks you through provisioning the backend (DynamoDB + Lambda + API Gateway), deploying the React/Vite frontend to S3 + CloudFront, wiring routes (incl. catch‑all), configuring CORS, and setting the CloudFront SPA fallback so deep links like `/projects` work.

> **What you’ll deploy**
>
> * **DynamoDB**: single table using a simple PK/SK pattern
> * **Lambda**: Node.js handler with CRUD for projects/boards, stories, issues, sprints, epics, tasks, users
> * **API Gateway (HTTP API v2)**: explicit and catch‑all routes to the Lambda
> * **S3 + CloudFront**: hosts the Vite SPA with SPA error fallbacks
>
> **Prereqs**: AWS CLI configured; Node 18+; an AWS account/role with permissions for Lambda, API Gateway v2, DynamoDB, S3, CloudFront.

---

## 1) Backend Data Model

**DynamoDB single table**

* **Partition key (PK)**: `STRING`
* **Sort key (SK)**: `STRING`

Items are stored like:

```
PK            SK        attrs
-----------   ------    --------------------------------------------------
BOARD#<id>    META#v1   { data: JSON(serialized board meta + columns/cards), updatedAt: ISO }
STORY#<id>    META#v1   { data: JSON(story fields...), updatedAt: ISO }
ISSUE#<id>    META#v1   { data: JSON(issue fields...), updatedAt: ISO }
SPRINT#<id>   META#v1   { data: JSON(sprint fields...), updatedAt: ISO }
EPIC#<id>     META#v1   { data: JSON(epic fields...), updatedAt: ISO }
TASK#<id>     META#v1   { data: JSON(task fields...), updatedAt: ISO }
USER#<id>     META#v1   { data: JSON(user fields...), updatedAt: ISO }
```

Create the table (console or CLI) with name (example) **`agileflow-prod`**.

---

## 2) Lambda Function

Create a Lambda (Node.js 18/20) named **`agileflow-api`** with env vars:

* `TABLE_NAME=agileflow-prod` (your table name)
* `ALLOWED_ORIGINS=https://<your-cloudfront-domain>,http://localhost:5173`

Attach an IAM role policy that allows **GetItem/PutItem/DeleteItem/Scan** on the table.

**Handler code (index.js)**

Use the stage‑aware, proxy‑aware handler that:

* Adds CORS on every response and handles `OPTIONS`
* Strips the stage prefix (e.g. `/prod`) from the request path
* Implements explicit **/boards** + **/projects** routes
* Implements catch‑all CRUD for `/stories|issues|sprints|epics|tasks|users`

> Use the version you last deployed in our discussion (stage‑aware `normalizedPath(event)`; proxy fallback; date normalization; CORS headers).

**Deploy** the function code (zip/upload, or via console editor). Confirm CloudWatch logs group `/aws/lambda/agileflow-api` is active.

---

## 3) API Gateway (HTTP API v2)

Create an HTTP API (or reuse your `agileflow-http`) and set up a Lambda proxy **integration** to `agileflow-api` with `PayloadFormatVersion=2.0`.

**Routes**

Add/confirm these routes:

* `GET /projects`  → integration to Lambda
* `POST /boards`   → integration to Lambda
* `GET /boards/{id}` / `PUT /boards/{id}` / `DELETE /boards/{id}` → Lambda
* `ANY /` → **catch‑all** integration to Lambda
* `ANY /{proxy+}` → **catch‑all** integration to Lambda

> Explicit routes (like `/projects`) take precedence; everything else falls through to `/{proxy+}` where the Lambda router handles `/stories`, `/issues`, `/sprints`, `/epics`, `/tasks`, `/users` etc.

**Stage**

Create a stage named **`prod`** with **Auto‑deploy = ON**.

Your base URL becomes:

```
https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

**Invoke permission**

Grant API Gateway permission to invoke Lambda:

```
arn:aws:execute-api:<region>:<account>:<api-id>/prod/*/*
```

**CORS (API level)**

Set HTTP API CORS with AllowOrigins including your CloudFront domain and `http://localhost:5173`, and methods `GET,POST,PUT,PATCH,DELETE,OPTIONS`.

> The Lambda also returns CORS headers; API‑level CORS helps when API Gateway itself returns 4XX/5XX.

**Smoke tests**

```
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/prod/projects
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/prod/stories
curl -i -X OPTIONS -H 'Origin: https://<cloudfront-domain>' \
  -H 'Access-Control-Request-Method: GET' \
  https://<api-id>.execute-api.<region>.amazonaws.com/prod/stories
```

Expect Lambda JSON payloads (not API Gateway’s `{"message":"Not Found"}`), and 204 for OPTIONS with `Access-Control-Allow-Origin`.

---

## 4) Frontend (React + Vite)

### 4.1 Configure API base (pick **one** pattern)

**Pattern A — direct to API Gateway (simplest)**

`.env.production`:

```
VITE_API_BASE=https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

`src/lib/http.js` should use **that absolute base** (or read from `window.__APP_API_BASE`). Example:

```js
// src/lib/http.js
export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');

function url(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function api(path, opts) {
  const res = await fetch(url(path), {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(()=>res.statusText)}`);
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
}
```

(Optional) In `index.html`, allow a query‑param override for quick testing:

```html
<script type="module">
  const envBase = import.meta.env?.VITE_API_BASE || '';
  const urlBase = new URL(location.href).searchParams.get('api') || '';
  window.__APP_API_BASE = (urlBase || envBase).replace(/\/+$/, '');
</script>
```

**Pattern B — go via CloudFront at `/api/*`**

* Create a **CloudFront behavior** for path pattern `/api/*` → origin = API Gateway domain.
* In the app, call relative paths like `/api/stories`:

```
VITE_API_PREFIX=/api
```

And in `http.js`:

```js
export const API_BASE = (import.meta.env.VITE_API_PREFIX || '/api').replace(/\/+$/, '');
```

> Don’t mix Pattern A & B. If you see requests going to `https://<cloudfront>/api/...` but your CF doesn’t route `/api/*` to API Gateway, you’ll get 403/404 from S3.

### 4.2 Date safety & entity API

* The frontend includes date utilities (`toValidDate`) and sanitizers to avoid `RangeError: Invalid time value` when a timestamp is missing or invalid.
* Components should **never** call `new Date(x)` without guarding; prefer helpers that fall back across `updated_date`, `updated_at`, `updatedAt`, `created_*`, etc.
* `src/api/entities.js` shapes project meta and provides stubs; the **Project** service uses `/boards` + `/projects` routes; other entity methods map to the Lambda CRUD.

### 4.3 Build

```
npm ci
npm run build
```

The build emits `dist/`.

---

## 5) S3 + CloudFront (SPA hosting)

### 5.1 S3 bucket

* Create a bucket (e.g., `agileflow-web-prod`) with **Block Public Access = ON**.
* Upload build artifacts to the bucket **(root)**.
* Consider setting `Cache-Control` headers: short/no‑cache on `index.html`, long max‑age on static assets (JS/CSS/images).

**Sync script**

```bash
aws s3 sync dist/ s3://agileflow-web-prod --delete
```

### 5.2 CloudFront distribution

* **Origin**: the S3 bucket with **Origin Access Control (OAC)**; update the bucket policy accordingly.
* **Default behavior**: points to S3 origin.
* (If using Pattern B) **Add behavior**: Path pattern `/api/*` → Origin = API Gateway (or an HTTP origin to the API Gateway hostname). Disable the SPA error response overrides on this behavior.

**SPA deep‑link fallback (fixes direct `/projects` loads)**

Create two **Custom error responses** on the **default S3 behavior**:

* HTTP error code **403** → **/index.html**, Response code **200**, **TTL = 0**
* HTTP error code **404** → **/index.html**, Response code **200**, **TTL = 0**

**Invalidate after deploys**

```bash
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths '/*'
```

---

## 6) CORS Recap

* **Lambda** returns CORS headers on **every** response and handles `OPTIONS`.
* **HTTP API** also has CORS enabled with your origins & methods.
* If you route through CloudFront to API Gateway (Pattern B), CORS still applies between browser ↔ CloudFront ↔ API Gateway.

---

## 7) Troubleshooting

**Direct `/projects` → 403 from CloudFront**

* Add the two **Custom error responses** (403 & 404 → `/index.html` 200) on the S3 behavior.

**`{"message":"Not Found"}` from API Gateway**

* That’s API Gateway’s own 404 (Lambda wasn’t invoked). Ensure routes `ANY /` and `ANY /{proxy+}` target your Lambda integration; confirm stage is `prod` and URL includes `/prod`.

**CORS errors**

* Ensure API‑level CORS **and** Lambda CORS are set; double‑check `ALLOWED_ORIGINS` env var; preflight (OPTIONS) should return 204 with `Access-Control-Allow-Origin`.

**Invalid time value** (frontend)

* Use guarded helpers: pick `updated_*` → `modified_*` → `created_*`; wrap with `toValidDate`; display `—` on null.

**Frontend hitting `https://<cloudfront>/api/...` and 403**

* Either switch to **Pattern A** (absolute `VITE_API_BASE`) or configure a CloudFront **/api/** behavior to API Gateway.

---

## 8) Useful CLI Snippets

**Show routes**

```bash
aws apigatewayv2 get-routes \
  --api-id <API_ID> --region <REGION> \
  --query 'Items[].{RouteKey:RouteKey,Target:Target}'
```

**Show integrations**

```bash
aws apigatewayv2 get-integrations --api-id <API_ID> --region <REGION>
```

**Add Lambda invoke permission**

```bash
aws lambda add-permission \
  --region <REGION> \
  --function-name agileflow-api \
  --statement-id agileflow-http-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:<REGION>:<ACCOUNT>:<API_ID>/prod/*/*
```

---

## 9) Deploy Flow Summary

1. **Backend**

   * Create DynamoDB table `agileflow-prod` (PK, SK)
   * Deploy Lambda `agileflow-api` with env vars & IAM policy
   * Create HTTP API (v2), Lambda proxy integration, routes (incl. `ANY /{proxy+}`), stage `prod`, CORS, invoke permission
   * `curl` test `/prod/projects` & `/prod/stories`
2. **Frontend**

   * Set **either** `VITE_API_BASE` (Pattern A) **or** `VITE_API_PREFIX=/api` (Pattern B)
   * `npm ci && npm run build`
   * `aws s3 sync dist/ s3://<bucket> --delete`
   * CloudFront: custom error responses (403/404 → `/index.html` 200), add `/api/*` behavior if using Pattern B
   * Invalidate CloudFront: `/*`

You’re done 🎉 The app should load at your CloudFront domain, resolve deep links, and talk to the API successfully.


