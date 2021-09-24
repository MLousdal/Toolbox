// Global variables
const url = "http://127.0.0.1:8118/api/";
const loginEndpoint = "users/login";
const signupEndpoint = "users/";
const toolsEndpoint = "tools/";
const favoritEndpoint = "favorite/";

// check if logged in
let token = localStorage.getItem("toolbox-token");

if (token && token !== null) {
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

  const hero = document.querySelector(".hero");

  if (hero) {
    hero.style.padding = "0";
    hero.classList.add("center-flex");
    hero.children[2].classList.add("hide");
  }
}

// -- Landing page --
// Scroll arrow
const arrow = document.querySelector("#arrow");
if (arrow) {
  arrow.addEventListener("click", () => {
    toolbox.scrollIntoView();
  });
}

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

// Remove skeletons
function removeSkeletons() {
  const skeletons = document.querySelectorAll(".skeleton");

  skeletons.forEach((skeleton) => {
    skeleton.remove();
  });
}

// Load all tools
if (toolbox) {
  const designTab = document.querySelector(".design");
  const uxTab = document.querySelector(".UX");
  const frontendTab = document.querySelector(".frontend");
  const backendTab = document.querySelector(".backend");

  fetch(url + toolsEndpoint, {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      removeSkeletons();
      data.forEach((tool) => {
        const toolHTML = `
        <article class="tool">
            <h4>${tool.toolTitle}</h4>
            <p>${tool.toolDescription}</p>
            <a href="${tool.toolLink}" target="_blank">visit tool..</a>
        </article>
        `;
        switch (tool.category.categoryId) {
          case 1:
            designTab.innerHTML += toolHTML;
            break;
          case 2:
            uxTab.innerHTML += toolHTML;
            break;
          case 3:
            frontendTab.innerHTML += toolHTML;
            break;
          case 4:
            backendTab.innerHTML += toolHTML;
            break;
          default:
            break;
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// -- login & signup --
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
    controller = new AbortController();
    signal = controller.signal;

    const LuserEmail = document.querySelector("#LuserEmail");
    const Lpassword = document.querySelector("#Lpassword");
    const data = {
      userEmail: LuserEmail.value,
      userPassword: Lpassword.value,
    };

    const Loutput = document.querySelector("#Loutput");

    fetch(url + loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status !== 200) {
          Loutput.innerHTML = `
          <span>ERROR: email or password is incorrect</span>
          `;
          controller.abort();
        }
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

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    controller = new AbortController();
    signal = controller.signal;

    const SUuserName = document.querySelector("#SUuserName");
    const SUuserEmail = document.querySelector("#SUuserEmail");
    const SUpassword = document.querySelector("#SUpassword");
    const data = {
      userName: SUuserName.value,
      userEmail: SUuserEmail.value,
      userPassword: SUpassword.value,
    };

    const SUoutput = document.querySelector("#SUoutput");
    fetch(url + signupEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status !== 200) {
          SUoutput.innerHTML = `
        <span>ERROR: Account not created</span>
        `;
          controller.abort();
        }
        return response.json();
      })
      .then((data) => {
        const userData = data;
        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "http://localhost:1234/forms.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

// -- myPage dashboard --
const myPageMain = document.querySelector("#myPage");

if (myPageMain) {
  const userData = localStorage.getItem("userData");
  const userName = JSON.parse(userData).userName;
  const userId = JSON.parse(userData).userId;
  const userRole = JSON.parse(userData)["userRole"].roleId;

  let myTools = `
  <section class="box" id="myTools">
    <h2>${userName}'s page</h2>
    <section>
      <h3>Favorite tools:</h3>
      <div class="tools">
      <div class="skeleton">
        <article class="tool"></article>
      </div>
      </div>
    </section>
`;
  if (userRole == 1) {
    myTools = `
      <section class="box" id="myTools">
        <h2>${userName}'s page</h2>
        <section>
          <h3>All tools:</h3>
          <div class="tools">
          <div class="skeleton">
            <article class="tool"></article>
          </div>
          </div>
        </section>
  `;
  }

  const myPageSubmit = `
  <section class="myPageForms">
  <form id="submitTool">
    <h3>Submit a new tool:</h3>
    <label for="Stitel">title: 
      <input type="text" id="Stitel" name="Stitel" required>
    </label>
    <label for="Sdesc">description:
      <textarea id="Sdesc" name="Sdesc" rows="3" required></textarea>
    </label>
    <label for="Slink">link: 
      <input type="text" id="Slink" name="Slink" required>
    </label>
    <label for="Scategory">category: 
      <select name="Scategory" id="Scategory" required>
        <option value="">--Please choose a category --</option>
        <option value="1">Design</option>
        <option value="2">UX</option>
        <option value="3">frontend</option>
        <option value="4">backend</option>
    </select>
    </label>
    <button class="btn active" id="SnewTool">submit</button>
  </form>
</section>
  `;
  myPageMain.innerHTML += myTools;
  myPageMain.innerHTML += myPageSubmit;

  const myPageTools = document.querySelector(".tools");

  // tool options
  let toolOptionsArr = [];

  function updateallToolOptions() {
    let toolOptionsArr = document.querySelectorAll(".toolOptions");
    toolOptionsArr.forEach((tool) => {
      const options = tool.children[1];
      const optionsBtn = tool.children[2];
      const updateBtn = options.children[0];
      const deleteBtn = options.children[1];

      const myPageForms = document.querySelector(".myPageForms");

      tool.addEventListener("click", (e) => {
        const id = tool.children[0].dataset.toolid;
        const title = tool.children[0].children[0].innerHTML;
        const desc = tool.children[0].children[1].innerHTML;
        const link = tool.children[0].children[2].href;

        switch (e.target) {
          case optionsBtn:
            options.classList.toggle("flex");
            break;
          case updateBtn:
            myPageForms.innerHTML += `
              <form id="updateTool" data-id="${id}">
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
              <option value="1">Design</option>
              <option value="2">UX</option>
              <option value="3">frontend</option>
              <option value="4">backend</option>
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

  //  if admin
  if (userRole == 1) {
    fetch(url + toolsEndpoint, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        removeSkeletons();
        data.forEach((tool) => {
          const toolHTML = `
          <article class="tool" data-toolID="${tool.toolId}">
              <h4>${tool.toolTitle}</h4>
              <p>${tool.toolDescription}</p>
              <a href="${tool.toolLink}" target="_blank">visit tool..</a>
          </article>
          `;
          myPageTools.innerHTML += `
          <div class="toolOptions">
          ${toolHTML}
          <div class="options">
            <button class="update btn">update</button>
            <button class="delete btn">delete</button>
          </div>
          <button class="optionsBtn">&#10247;</button>
          </div>
          `;
        });
        updateallToolOptions();
      })
      .catch((error) => {
        console.error("Error:", error);
        myPageTools.innerHTML = `
        <span class="flex center-flex">You don't have any favorite tools</span>
        `;
      });
  }

  // if member
  if (userRole == 2) {
    fetch(url + toolsEndpoint + favoritEndpoint + userId, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        removeSkeletons();
        data.forEach((tool) => {
          const toolHTML = `
        <article class="tool">
            <h4>${tool.toolTitle}</h4>
            <p>${tool.toolDescription}</p>
            <a href="${tool.toolLink}" target="_blank">visit tool..</a>
        </article>
        `;
          myPageTools.innerHTML += toolHTML;
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        myPageTools.innerHTML = `
      <span class="flex center-flex">You don't have any favorite tools</span>
      `;
      });
  }

  // AllmyPageForms
  let AllmyPageForms = [];

  function updateAllmyPageForms() {
    let AllmyPageForms = document.querySelectorAll(".myPageForms form");

    AllmyPageForms.forEach((form) => {
      const submitTool = document.querySelector("#submitTool");
      const updateTool = document.querySelector("#updateTool");

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const userData = localStorage.getItem("userData");
        const userId = JSON.parse(userData).userId;
        const toolToolId = e.target.dataset.id;
        console.log(toolToolId)
        const toolTitle = e.target[0].value;
        const toolDescription = e.target[1].value;
        const toolLink = e.target[2].value;
        const toolCategoryId = e.target[3].value;

        const pattern = /^((http|https|ftp):\/\/)/;

        switch (e.target) {
          case submitTool:
            let postData = {
              userId: userId,
              toolTitle: toolTitle,
              toolDescription: toolDescription,
              toolLink: toolLink,
              toolCategoryId: toolCategoryId,
            };
            if (!pattern.test(toolLink)) {
              submitTool.innerHTML += `<span>Invalid link: add https://</span>`;
              break;
            }

            fetch(url + toolsEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(postData),
            })
              .then((response) => {
                return response.json();
              })
              .then((data) => {
                console.log(data);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
            break;
          case updateTool:
            updateData = {
              toolTitle: toolTitle,
              toolDescription: toolDescription,
              toolLink: toolLink,
              toolCategoryId: toolCategoryId,
            };

            if (!pattern.test(toolLink)) {
              submitTool.innerHTML += `<span>Invalid link: add https://</span>`;
              break;
            }
            console.log(url + toolsEndpoint + userId + "/" + toolToolId)

            fetch(url + toolsEndpoint + userId + "/" + toolToolId, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updateData),
            })
              .then((response) => {
                return response.json();
              })
              .then((data) => {
                console.log(data);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
            break;
          default:
            break;
        }
      });
    });
  }

  updateAllmyPageForms();
}
