document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("#joingame").addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = document.querySelector("#key").value;
    const checkUrl = new URL('/check_game', server);

    const req = await fetch(checkUrl, {
      method: "POST",
      body: JSON.stringify({ "key": key }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    const resp = await req.json();

    // 2. Create clean URLs for the redirects.
    const gameUrl = new URL(`/game/${key}`, server);
    const fullUrl = new URL('/full', server);

    if (resp === true || localStorage.getItem(`socketid_${key}`) != null) {
      // 3. Use the .href property for a guaranteed correct URL.
      window.location.href = gameUrl.href;
    } else {
      window.location.href = fullUrl.href;
    }
  });
});