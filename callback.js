const main = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const storedState = sessionStorage.getItem('auth_state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (!code || !codeVerifier || state !== storedState) {
        const error_message = "Erro de segurança ou código inválido."
        window.location.href = `${ORIGIN}/error.html?error_message=${error_message}`
    } else {
        try {
            const body = {
                client_id: CLIENT_ID, // Exported from env.js
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${ORIGIN}/callback.html`,
                code_verifier: codeVerifier
            }

            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json()


            sessionStorage.setItem('access_token', data.access_token);
            window.location.href = `${ORIGIN}/dashboard.html`
        } catch (error) {
            const error_message = `${error.message}`
            window.location.href = `${ORIGIN}/error.html?error_message=${error_message}`
        }
    }
}

document.addEventListener("DOMContentLoaded", main)