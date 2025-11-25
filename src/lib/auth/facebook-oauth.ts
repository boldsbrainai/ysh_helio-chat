export function buildFacebookOAuthUrl(redirectUri?: string): string {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID
  if (!appId) {
    throw new Error("VITE_FACEBOOK_APP_ID não configurado")
  }

  const resolvedRedirect = redirectUri ?? `${window.location.origin}/auth/callback`
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: resolvedRedirect,
    scope: "email,public_profile",
    response_type: "code",
    auth_type: "rerequest"
  })

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
}

export function loginWithFacebook(redirectUri?: string) {
  const authUrl = buildFacebookOAuthUrl(redirectUri)
  window.location.href = authUrl
}
