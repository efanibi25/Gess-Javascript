document.addEventListener("DOMContentLoaded", (event) => {
    document.querySelector("#creategame").addEventListener("submit",async(e)=>{
      e.preventDefault()
      let req=await fetch(`${server}/create_game`,
    
      );
      let resp=await req.json()
      let node=document.querySelector("#game")
      node.innerHTML=
     `
     <p>join game at <a href="${server}/game/${resp}">${server}/game/${resp}</a><\p>
     <br>
     <p>Give link to opponent<\p>
     <p>Or the Code: ${resp} <\p>
     <p>So they can join<\p>



     `  
     node.style.display="block"
         
        })
  });