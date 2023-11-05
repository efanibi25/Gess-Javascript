

document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("#joingame").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let key=document.querySelector("#key").value
    let req=await fetch(`${host}:${server}/check_game`,
    {method: "POST",
    "body":JSON.stringify({"key":key}),
      headers: {
    "Content-Type": "application/json"}
    
    
    
    },

    );
    let resp=await req.json()
    if (resp==true){
      window.location.href = `${host}:${server}/game/${key}`;
    }
    else if(localStorage.getItem(`socketid_${key}`)!=null){
      window.location.href = `${host}:${server}/game/${key}`;
    }
    else{
         window.location.href = `${host}:${server}/full`;

    }
    

       
      })
});