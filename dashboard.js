const main = async () => {
    try {
        const token = sessionStorage.getItem('access_token');
        const role = sessionStorage.getItem("role")

        if (!token) {
            throw new Error(`Token não encontrado!`);
        }

        if (!role) {
            throw new Error(`Role não foi identificada!`);
        }

        const logoffButton = document.querySelector("#button-logoff")

        logoffButton.addEventListener("click", () => {
            sessionStorage.clear()
            window.location.href = `${ORIGIN}`
        })

        const updateAlbumData = async () => {
            const albumData = document.querySelector("#current-playing-data")

            const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }


            let currentPlayingData = {}
            try {
                currentPlayingData = await response.json();
            } catch (error) { }

            const albumImages = currentPlayingData?.item?.album?.images
            let albumImageURL = null
            if (Array.isArray(albumImages) && albumImages.length > 0) {
                albumImageURL = albumImages[0]?.url
            }

            const artists = currentPlayingData?.item?.artists
            let artistsNames = ""
            if (Array.isArray(artists)) {
                artistsNames = artists.map(artist => artist?.name).join(", ")
            }

            const durationMS = currentPlayingData?.item?.duration_ms
            let durationMinutes
            let durationSeconds
            if (durationMS) {
                durationMinutes = Math.floor((parseInt(durationMS) / 1000) / 60)
                durationSeconds = durationMinutes % 60
            }

            albumData.innerHTML = `
            <img class="m-4" src="${albumImageURL}" alt="Album Image" width="200px">
            <ul class="list-group w-100">
                <li class="list-group-item"><strong>Música:</strong> ${currentPlayingData?.item?.name}</li>
                <li class="list-group-item"><strong>Duração:</strong> ${durationMinutes}m ${durationSeconds}s</li>
                <li class="list-group-item"><strong>Album:</strong> ${currentPlayingData?.item?.album?.name}</li>
                <li class="list-group-item"><strong>Artista(s):</strong> ${artistsNames}</li>
            </ul>
        `
        }

        updateAlbumData()
        setInterval(updateAlbumData, 10000);

        // Load pause button
        if (role === "manager") {
            const player_div = document.querySelector("#player")

            player_div.innerHTML = `
            <div class="d-flex">
                <button id="previous-button" type="button" class="btn btn-primary m-1">&lt;&lt;</button>
                <button id="play-stop-button" type="button" class="btn btn-primary m-1">Play/Stop</button>
                <button id="next-button" type="button" class="btn btn-primary m-1">&gt;&gt;</button>
            </div>
        `

            // const player = document.querySelector("#player")
            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;

            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new window.Spotify.Player({
                    name: 'Web Playback SDK',
                    getOAuthToken: cb => { cb(token); },
                    volume: 0.5
                });

                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                });

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });

                player.connect();

                const playStopButton = document.querySelector("#play-stop-button")
                playStopButton.addEventListener("click", () => {
                    player.togglePlay()
                })

                const previousButton = document.querySelector("#previous-button")
                previousButton.addEventListener("click", () => {
                    player.previousTrack()
                })

                const nextButton = document.querySelector("#next-button")
                nextButton.addEventListener("click", () => {
                    player.nextTrack()
                })
            };
        }
    } catch (error) {
        const error_message = `${error.message}`
        window.location.href = `${ORIGIN}/error.html?error_message=${error_message}`
    }
}

document.addEventListener("DOMContentLoaded", main)