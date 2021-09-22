// Global variables
const url = "http://127.0.0.1:8118/api/";
const loginEndpoint = "users/login";
const signupEndpoint = "users/";

// toggle between categories
const toolbox = document.querySelector(".toolbox");
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

  btnContainer.addEventListener("click", (e) => {
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

// Scroll arrow
const arrow = document.querySelector("#arrow");
if (arrow) {
  arrow.addEventListener("click", () => {
    toolbox.scrollIntoView();
  });
}

// toggle between forms (login or signup)
const forms = document.querySelector(".forms");

if (forms) {
  const btnContainer = document.querySelector(".btn-container");
  const loginBtn = document.querySelector("#login");
  const loginForm = document.querySelector(".login");
  const signupBtn = document.querySelector("#signup");
  const signupForm = document.querySelector(".signup");

  btnContainer.addEventListener("click", (e) => {
    switch (e.target) {
      case loginBtn:
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
        loginForm.style.display = "flex";
        signupForm.style.display = "none";
        break;
      case signupBtn:
        loginBtn.classList.remove("active");
        signupBtn.classList.add("active");
        signupForm.style.display = "flex";
        loginForm.style.display = "none";
        break;
    }
  });


  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const LuserEmail = document.querySelector("#LuserEmail");
    const Lpassword = document.querySelector("#Lpassword");
    const data = {
      userEmail: LuserEmail.value,
      userPassword: Lpassword.value,
    };

    fetch(url + loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        const toolboxToken = response.headers.get("toolbox-token");
        localStorage.setItem("toolbox-token", toolboxToken);
        window.location.href = "http://localhost:1234/index.html";
        return response.json();
      })
      .then((data) => {
        const userData = data;
        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "http://localhost:1234/index.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const SUuserName = document.querySelector("#SUuserName");
    const SUuserEmail = document.querySelector("#SUuserEmail");
    const SUpassword = document.querySelector("#SUpassword");
    const data = {
      userName: SUuserName.value,
      userEmail: SUuserEmail.value,
      userPassword: SUpassword.value,
    };

    fetch(url + signupEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        const toolboxToken = response.headers.get("toolbox-token");
        localStorage.setItem("toolbox-token", toolboxToken);
        return response.json();
      })
      .then((data) => {
        const userData = data;
        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "http://localhost:1234/index.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

// check if logged in
let token = localStorage.getItem('toolbox-token');

if (token) {
  const navLinks = document.querySelector("#nav-links");
  
  navLinks.innerHTML = `
  <li><a href="mypage.html" class="underline">my page</a></li>
  <li><button class="btn scale" id="logoutBtn">logout</button></li>
  `;
  
  const logoutBtn = document.querySelector("#logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "http://localhost:1234/index.html";
  });

}

// tool options
const allToolOptions = document.querySelectorAll(".toolOptions");

if (allToolOptions) {
  allToolOptions.forEach((tool) => {
    const options = tool.children[1];
    const optionsBtn = tool.children[2];
    const updateBtn = options.children[0];
    const deleteBtn = options.children[1];

    const myPageForms = document.querySelector(".myPageForms");

    const title = tool.children[0].children[0].innerHTML;
    const desc = tool.children[0].children[1].innerHTML;
    const link = tool.children[0].children[2].href;

    tool.addEventListener("click", (e) => {
      switch (e.target) {
        case optionsBtn:
          options.classList.toggle("flex");
          break;
        case updateBtn:
          myPageForms.innerHTML += `
          <form id="updateTool">
            <h3>Update: ${title}</h3>
            <label for="Utitel">title: 
              <input type="text" id="Utitel" name="updateTool" required value="${title}">
            </label>
            <label for="Udesc">description:
              <textarea id="Udesc" name="updateTool" rows="3" required>${desc}</textarea>
            </label>
            <label for="Ulink">link: 
              <input type="text" id="Ulink" name="updateTool" required value="${link}">
            </label>
            <label for="Ucategory">category: 
              <select name="updateTool" id="Ucategory" required>
                <option value="">--Please choose a category --</option>
                <option value="design">Design</option>
                <option value="UX">UX</option>
                <option value="frontend">frontend</option>
                <option value="backend">backend</option>
            </select>
            </label>
            <button class="btn active" id="UoldTool">submit</button>
          </form>
          `;
          options.classList.toggle("flex");
          updateAllmyPageForms();
          break;
        case deleteBtn:
          if (confirm("Are you sure?")) {
            console.log("send for delete");
            tool.style.display = "none";
          } else {
            console.log("not sure");
          }
          options.classList.toggle("flex");
          updateAllmyPageForms();
          break;
        default:
          break;
      }
    });
  });
}

// AllmyPageForms
const myPageForms = document.querySelector(".myPageForms");

if (myPageForms) {
  let AllmyPageForms = [];

  function updateAllmyPageForms() {
    let AllmyPageForms = document.querySelectorAll(".myPageForms form");
    console.log(AllmyPageForms);

    AllmyPageForms.forEach((form) => {
      const submitToolBtn = document.querySelector("#SnewTool");
      const updateToolBtn = document.querySelector("#UoldTool");

      form.addEventListener("click", (e) => {
        switch (e.target) {
          case submitToolBtn:
            console.log("submitTool");
            // ready for fetch integration
            break;
          case updateToolBtn:
            console.log("updateTool");
            // ready for fetch integration
            break;
          default:
            break;
        }
      });
    });
  }

  updateAllmyPageForms();
}
