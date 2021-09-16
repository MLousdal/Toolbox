// Scroll arrow
const toolbox = document.querySelector(".toolbox");
const arrow = document.querySelector("#arrow");

if (arrow) {
  arrow.addEventListener("click", () => {
    toolbox.scrollIntoView();
  });
}

// toggle between categories
if (toolbox) {
  const design = document.querySelector("#design");
  const designSec = document.querySelector(".design");
  const UX = document.querySelector("#UX");
  const uxSec = document.querySelector(".UX");
  const frontend = document.querySelector("#frontend");
  const frontendSec = document.querySelector(".frontend");
  const backend = document.querySelector("#backend");
  const backendSec = document.querySelector(".backend");

  const btnContainer = document.querySelector(".btn-container");

  designSec.style.display = "grid";

  btnContainer.addEventListener("click", (e)=> {
    switch (e.target) {
      case design:
        designSec.style.display = "grid";
        uxSec.style.display = "none";
        frontendSec.style.display = "none";
        backendSec.style.display = "none";
        break;
      case UX:
        designSec.style.display = "none";
        uxSec.style.display = "grid";
        frontendSec.style.display = "none";
        backendSec.style.display = "none";
        break;
      case frontend:
        designSec.style.display = "none";
        uxSec.style.display = "none";
        frontendSec.style.display = "grid";
        backendSec.style.display = "none";
        break;
      case backend:
        designSec.style.display = "none";
        uxSec.style.display = "none";
        frontendSec.style.display = "none";
        backendSec.style.display = "grid";
        break;
    
      default:
        break;
    }
  });
}


// toggle between forms
const forms = document.querySelector(".forms");

if (forms) {
  const loginBtn = document.querySelector("#login");
  const loginForm = document.querySelector(".login")
  
  const signupBtn = document.querySelector("#signup");
  const signupForm = document.querySelector(".signup");

  const btnContainer = document.querySelector(".btn-container");
  
  btnContainer.addEventListener("click", (e) => {
    switch (e.target) {
      case loginBtn:
        loginForm.style.display = "flex";
        signupForm.style.display = "none";
        break;
        case signupBtn: 
        signupForm.style.display = "flex";
        loginForm.style.display = "none";
        break;
    }
  });  
}

