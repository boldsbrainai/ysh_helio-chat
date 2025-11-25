import { createServer } from "node:http"
import { randomUUID } from "node:crypto"

const PORT = Number(process.env.PORT || 8787)
const FACEBOOK_GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || "v19.0"
const GRAPH_BASE_URL = `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}`
const JSON_HEADERS = { "Content-Type": "application/json" }

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, JSON_HEADERS)
  res.end(JSON.stringify(payload))
}

async function parseRequestBody(req) {
  return await new Promise((resolve, reject) => {
    let body = ""
    req.on("data", chunk => { body += chunk })
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on("error", reject)
  })
}

async function exchangeCodeForToken(code, redirectUri) {
  const appId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error("FACEBOOK_APP_ID e FACEBOOK_APP_SECRET são obrigatórios")
  }

  const query = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })

  const tokenResponse = await fetch(`${GRAPH_BASE_URL}/oauth/access_token?${query.toString()}`)
  if (!tokenResponse.ok) {
    const errorPayload = await tokenResponse.json().catch(() => ({}))
    throw new Error(`Erro ao obter access token: ${JSON.stringify(errorPayload)}`)
  }

  return tokenResponse.json()
}

async function fetchFacebookProfile(accessToken) {
  const profileResponse = await fetch(`${GRAPH_BASE_URL}/me?fields=id,name,email,picture&access_token=${accessToken}`)
  if (!profileResponse.ok) {
    const errorPayload = await profileResponse.json().catch(() => ({}))
    throw new Error(`Erro ao obter perfil: ${JSON.stringify(errorPayload)}`)
  }

  return profileResponse.json()
}

createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/auth/facebook/callback") {
    try {
      const { code, redirectUri } = await parseRequestBody(req)

      if (!code || !redirectUri) {
        sendJson(res, 400, { error: "code e redirectUri são obrigatórios" })
        return
      }

      const tokenPayload = await exchangeCodeForToken(code, redirectUri)
      const profile = await fetchFacebookProfile(tokenPayload.access_token)

      const user = {
        id: profile.id,
        email: profile.email ?? `${profile.id}@facebook.com`,
        name: profile.name ?? "Usuário Facebook",
        avatarUrl: profile.picture?.data?.url,
        createdAt: Date.now(),
        session: {
          accessToken: tokenPayload.access_token,
          expiresAt: Date.now() + (tokenPayload.expires_in ?? 3600) * 1000,
          plan: "free",
        },
      }

      const sessionToken = randomUUID()
      sendJson(res, 200, { user, sessionToken })
    } catch (error) {
      console.error("[facebook-auth]", error)
      sendJson(res, 500, { error: error.message || "Erro interno" })
    }
    return
  }

  sendJson(res, 404, { error: "Not found" })
}).listen(PORT, () => {
  console.log(`Facebook auth server listening on http://localhost:${PORT}`)
})
