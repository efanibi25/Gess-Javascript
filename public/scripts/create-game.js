document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("#creategame").addEventListener("submit", async (e) => {
    e.preventDefault();

    const create_url = new URL('create_game', server);
    let req = await fetch(create_url); // Use the URL object you created
    let resp = await req.json();

    // Create the clean join URL using the same method
    const join_url = new URL(`/game/${resp}`, server);

    let node = document.querySelector("#game");
    node.innerHTML = `
      <p>join game at <a href="${join_url.href}">${join_url.href}</a></p>
      <br>
      <p>Give link to opponent</p>
      <p>Or the Code: ${resp}</p>
      <p>So they can join</p>
    `;
    node.style.display = "block";
  });
});