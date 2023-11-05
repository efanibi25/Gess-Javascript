

document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("#joingame").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let key=document.querySelector("#key").value
    console.log(`http://localhost:${server}/check_game`)
    let req=await fetch(`http://localhost:${server}/check_game`,
    {method: "POST",
    "body":JSON.stringify({"key":key}),
      headers: {
    "Content-Type": "application/json"}
    
    
    
    },

    );
    let resp=await req.json()
    if (resp==true){
      window.location.href = `http://localhost:${server}/game/${key}`;
    }
    else if(localStorage.getItem(`socketid_${key}`)!=null){
      window.location.href = `http://localhost:${server}/game/${key}`;
    }
    else{
         window.location.href = `http://localhost:${server}/full`;

    }
    

       
      })
});