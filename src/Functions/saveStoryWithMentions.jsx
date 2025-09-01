// src/Functions/saveStoryWithMentions.jsx
// Required permissions: --allow-net --allow-env if running locally with Deno

/**
 * Minimal user and story types (adjust to your model)
 */
function escapeRegExp(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// ---------- Auth (replace with your real verification e.g. JWT) ----------
async function getCurrentUser(req) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;

  const token = auth.slice(7).trim();
  const expected = Deno.env?.get?.("API_TOKEN") || "dev-token";

  if (token === expected) {
    return {
      id: "me",
      email: Deno.env?.get?.("API_USER_EMAIL") || "user@example.com",
      full_name: Deno.env?.get?.("API_USER_NAME") || "Current User",
    };
  }
  return null;
}

// ---------- Persistence helpers (replace with real DB/API calls) ----------
/**
 * Save story (create or update) in your backend.
 * If you already have API Gateway endpoints, call them here via fetch.
 * For now, this uses an in-memory map (replace as needed).
 */
const __stories = new Map();

async function upsertStory({ storyId, data, actorEmail }) {
  const now = new Date().toISOString();
  if (storyId && __stories.has(storyId)) {
    const existing = __stories.get(storyId);
    const updated = {
      ...existing,
      ...data,
      id: storyId,
      updated_at: now,
      updated_by: actorEmail,
    };
    __stories.set(storyId, updated);
    return updated;
  }

  if (storyId && !__stories.has(storyId)) {
    const created = {
      id: storyId,
      ...data,
      created_at: now,
      updated_at: now,
      created_by: actorEmail,
      updated_by: actorEmail,
    };
    __stories.set(storyId, created);
    return created;
  }

  const id = crypto.randomUUID();
  const created = {
    id,
    ...data,
    created_at: now,
    updated_at: now,
    created_by: actorEmail,
    updated_by: actorEmail,
  };
  __stories.set(id, created);
  return created;
}

/**
 * List users to check mentions against.
 * Replace with your real users source (DB/API).
 */
async function listUsers() {
  return [
    { id: "u1", email: "alice@example.com", full_name: "Alice Tan" },
    { id: "u2", email: "bob@example.com", full_name: "Bob Lim" },
  ];
}

// ---------- Email notification (replace with your provider) ----------
async function sendEmail({ to, subject, html }) {
  const url = Deno.env?.get?.("EMAIL_WEBHOOK_URL"); // optional
  const key = Deno.env?.get?.("EMAIL_API_KEY"); // optional

  if (!url) {
    console.log("[EmailStub] ->", { to, subject, html });
    return;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Email API failed: ${res.status} ${txt}`);
  }
}

// ---------- The handler ----------
export default {
  async fetch(req) {
    try {
      // Auth
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Parse input
      const { storyId, data } = await req.json();
      if (!data || typeof data !== "object") {
        return new Response(JSON.stringify({ error: "Invalid body: missing data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Create or update the story
      const savedStory = await upsertStory({
        storyId,
        data,
        actorEmail: currentUser.email,
      });

      // Mentions detection (@Full Name or @email)
      const textToCheck = `${String(data?.description ?? "")} ${String(
        data?.user_story ?? "",
      )}`;

      if (textToCheck.includes("@")) {
        const allUsers = await listUsers();
        const notified = new Set();

        for (const user of allUsers) {
          if (notified.has(user.id)) continue;
          if (user.email === currentUser.email) continue; // skip self

          let mentioned = false;

          if (user.full_name) {
            const nameRe = new RegExp(`@${escapeRegExp(user.full_name)}\\b`, "i");
            if (nameRe.test(textToCheck)) mentioned = true;
          }
          if (!mentioned && user.email) {
            const emailRe = new RegExp(`@${escapeRegExp(user.email)}\\b`, "i");
            if (emailRe.test(textToCheck)) mentioned = true;
          }

          if (mentioned) {
            notified.add(user.id);
            try {
              await sendEmail({
                to: user.email,
                subject: `You were mentioned in story: ${
                  savedStory.title ?? savedStory.id
                }`,
                html: `
                  <p>Hi ${user.full_name ?? user.email},</p>
                  <p><strong>${currentUser.full_name ?? currentUser.email}</strong> mentioned you in the story "<strong>${
                    savedStory.title ?? savedStory.id
                  }</strong>".</p>
                  <hr>
                  <p><strong>User Story:</strong><br/>${
                    data?.user_story || "No user story provided."
                  }</p>
                  ${
                    data?.description
                      ? `<p><strong>Description:</strong><br/>${String(data.description).replace(
                          /\n/g,
                          "<br>",
                        )}</p>`
                      : ""
                  }
                  <hr>
                  <p>Log in to AgileFlow to view the full details.</p>
                  <p>Best regards,<br/>AgileFlow</p>
                `.trim(),
              });
            } catch (e) {
              console.error(`Failed to send notification to ${user.email}:`, e);
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, story: savedStory }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error in saveStoryWithMentions:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save story", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
};
