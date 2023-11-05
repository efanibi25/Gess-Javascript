document.addEventListener("DOMContentLoaded", (event) => {
    document.querySelector("#creategame").addEventListener("submit",async(e)=>{
      e.preventDefault()
      let req=await fetch(`${host}:${server}/create_game`,
    
      );
      let resp=await req.json()
      let node=document.createElement("div");
      node.innerHTML=
     `
     <p>join game at ${host}:${server}/game/${resp}<\p>
     <br>
     <p>Give link to opponent so they can join<\p>
     `
      document.body.appendChild(node)
  
         
        })
  });