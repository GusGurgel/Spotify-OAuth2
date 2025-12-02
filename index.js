const loginButton = document.querySelector("#login-button")

function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(n => charset[n % charset.length]).join('');
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

loginButton.addEventListener("click", async () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('auth_state', state);
    sessionStorage.setItem('role', document.querySelector("#role-select").value);

    let scope = ""
    if (sessionStorage.getItem("role") == "viewer") {
        scope = "user-read-currently-playing"
    } else if (sessionStorage.getItem("role") == "manager") {
        scope = "streaming user-read-currently-playing user-read-email user-read-private"
    }

    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID, // Exported from env.js
        redirect_uri: `${window.location.origin}/callback.html`,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
})