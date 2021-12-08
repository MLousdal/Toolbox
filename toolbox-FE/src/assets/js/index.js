// Global variables
const url = "mmdwad0920-toolbox.azurewebsites.net/api/";
const loginEndpoint = "users/login";
const signupEndpoint = "users/";
const toolsEndpoint = "tools/";
const favoritEndpoint = "favorite/";
const deleteEndpoint = "delete/";
const creatorEndpoint = "creator/";

const notifications = document.querySelector(".notifications");

// check system preferred color scheme
const body = document.querySelector("body");
const mqPCS = window.matchMedia("prefers-color-scheme");

window.onload = () => {
  const userPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const userPrefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  if (userPrefersDark) {
    body.classList.add("theme-dark");
  }

  if (userPrefersLight) {
    body.classList.add("theme-light");
  }
};

// Toggle color theme by pressing 1
document.addEventListener("keydown", themeToggle);
function themeToggle(key) {
  if (key.code == "Digit1") {
    if (body.classList.contains("theme-light")) {
      body.classList.replace("theme-light", "theme-dark");
    } else {
      body.classList.replace("theme-dark", "theme-light");
    }
  }
}

// check if logged in (saved token)
let token = localStorage.getItem("toolbox-token");

if (token && token !== null) {
  const navLinks = document.querySelector("#nav-links");

  navLinks.innerHTML = `
  <li><a href="mypage.html" class="underline">my page</a></li>
  <li><button class="btn btn-error" id="logoutBtn">logout</button></li>
  `;

  const logoutBtn = document.querySelector("#logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/index.html";
  });

  const hero = document.querySelector(".hero");

  if (hero) {
    hero.style.padding = "0";
    hero.classList.add("flex", "center", "text");
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

  // Show the designSec by default
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

// favorite button
function favoriteBtn() {
  let allfavoriteBtn = document.querySelectorAll(".favorite");

  if (token) {
    userData = localStorage.getItem("userData");
    userId = JSON.parse(userData).userId;
  }

  // if not logged in hide the buttons
  if (!token) {
    allfavoriteBtn.forEach((btn) => {
      btn.classList.add("hide");
    });
  }

  allfavoriteBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      controller = new AbortController();
      signal = controller.signal;

      const toolToolId = e.target.parentElement.dataset.id;

      const data = {
        toolId: toolToolId,
        userId: userId,
      };

      fetch(url + toolsEndpoint + favoritEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "toolbox-token": localStorage.getItem("toolbox-token"),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
        .then((response) => {
          if (response.status == 409) {
            notifications.innerHTML = `<span class="notification box background-error">Already a favorite</span>`;
            setTimeout(() => {
              document.querySelector(".notification").remove();
            }, 5000);
            controller.abort();
          }
          return response.json();
        })
        .then((data) => {
          notifications.innerHTML = `<span class="notification box background-success">Tool was successfully added from favorites</span>`;
          setTimeout(() => {
            document.querySelector(".notification").remove();
          }, 5000);
          favoriteBtn();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });
}

// unfavorite button
function unfavoriteBtn() {
  let allUnfavoriteBtn = document.querySelectorAll(".unfavorite");
  const userData = localStorage.getItem("userData");
  const userId = JSON.parse(userData).userId;

  allUnfavoriteBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      controller = new AbortController();
      signal = controller.signal;
      const toolToolId = e.target.parentElement.dataset.id;

      fetch(url + toolsEndpoint + "/" + userId + "/" + toolToolId, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "toolbox-token": localStorage.getItem("toolbox-token"),
        },
        signal: controller.signal,
      })
        .then((response) => {
          if (response.status == 409) {
            controller.abort();
          }
          return response.json();
        })
        .then((data) => {
          e.target.parentElement.remove();
          notifications.innerHTML = `<span class="notification box background-success">Tool was successfully removed from favorites</span>`;
          setTimeout(() => {
            document.querySelector(".notification").remove();
          }, 5000);
          unfavoriteBtn();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });
}

// Load all tools on the landing page
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
        <article class="tool" data-id="${tool.toolId}">
            <h5>${tool.toolTitle}</h5>
            <p>${tool.toolDescription}</p>
            <a href="${tool.toolLink}" target="_blank">visit tool..</a>
            <input type="image" alt="" src="plus.svg" class="favorite icon" />
        </article>
        `;
        // sort the tools based on category
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
      favoriteBtn();
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

  // Switch between login and signup forms
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

  // login form
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
    loginForm.querySelector(".btn").classList.add("loading");

    fetch(url + loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "toolbox-token": localStorage.getItem("toolbox-token"),
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status !== 200) {
          notifications.innerHTML = `
          <span class="notification box background-error">email or password is incorrect</span>
          `;
          setTimeout(() => {
            document.querySelector(".notification").remove();
          }, 5000);
          controller.abort();
          loginForm.querySelector(".btn").classList.remove("loading");
        }
        const toolboxToken = response.headers.get("toolbox-token");
        localStorage.setItem("toolbox-token", toolboxToken);
        return response.json();
      })
      .then((data) => {
        const userData = data;
        localStorage.setItem("userData", JSON.stringify(userData));
        loginForm.querySelector(".btn").classList.remove("loading");
        window.location.href = "/index.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  // signup form
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

    fetch(url + signupEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "toolbox-token": localStorage.getItem("toolbox-token"),
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status !== 200) {
          notifications.innerHTML = `
        <span class="notification box background-error">ERROR: Account not created</span>
        `;
          setTimeout(() => {
            document.querySelector(".notification").remove();
          }, 5000);
          controller.abort();
        }
        return response.json();
      })
      .then((data) => {
        const userData = data;
        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "/forms.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

// -- myPage dashboard --
const myPageMain = document.querySelector("#myPage");

// tool options
function toolOptions() {
  toolOptionsArr = document.querySelectorAll(".tool.withOptions");

  // Page breaks if there are no buttons in the array
  // specifically in the tool.addEventListener
  if (toolOptionsArr.length > 0) {
    toolOptionsArr.forEach((tool) => {
      const options = tool.querySelector(".options");
      const optionsBtn = tool.querySelector(".optionsBtn");
      const updateBtn = tool.querySelector(".update");
      const deleteBtn = tool.querySelector(".delete");

      const myPageForms = document.querySelector(".myPageForms");

      optionsBtn.addEventListener("click", (e) => {
        options.classList.toggle("flex");
      });

      tool.addEventListener("click", (e) => {
        const id = tool.dataset.toolid;
        const title = tool.children[0].innerHTML;
        const desc = tool.children[1].innerHTML;
        const link = tool.children[2].href;

        switch (e.target) {
          case updateBtn:
            myPageForms.innerHTML += `
              <form id="updateTool" class="box" data-id="${id}">
              <h5>Update: ${title}</h5>
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
              <button class="btn flex align-center" id="UoldTool">submit</button>
              </form>
              `;
            options.classList.toggle("flex");
            updateAllmyPageForms();
            break;
          case deleteBtn:
            deleteBtn.classList.add("loading");

            if (confirm("Are you sure?")) {
              fetch(url + toolsEndpoint + deleteEndpoint + id, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "toolbox-token": localStorage.getItem("toolbox-token"),
                },
              })
                .then((response) => {
                  return response.json();
                })
                .then((data) => {
                  options.classList.toggle("flex");
                  deleteBtn.classList.remove("loading");
                  tool.remove();
                  updateAllmyPageForms();
                  notifications.innerHTML = `
                <span class="notification box background-success">Tool successfully deleted</span>
                `;
                  setTimeout(() => {
                    document.querySelector(".notification").remove();
                  }, 5000);
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            }
            break;
        }
      });
    });
  }
}

function myPageBtnContainer() {
  const btnContainer = document.querySelector(".btn-container");
  // Only added if member
  let favoriteBtn = "";
  let favoriteTools = "";
  const myToolsBtn = document.querySelector("#myToolsBtn");
  const myToolsSec = document.querySelector(".myToolsSec");
  const userData = localStorage.getItem("userData");
  const roleId = JSON.parse(userData).userRole.roleId;
  // Only added if admin
  let allToolsBtn = "";
  let allTools = "";

  if (roleId == 1) {
    allToolsBtn = document.querySelector("#allToolsBtn");
    allTools = document.querySelector(".tools");
  }

  if (roleId == 2) {
    favoriteBtn = document.querySelector("#favoriteToolsBtn");
    favoriteTools = document.querySelector(".tools");
  }

  btnContainer.addEventListener("click", (e) => {
    switch (e.target) {
      case favoriteBtn:
        favoriteBtn.classList.add("active");
        myToolsBtn.classList.remove("active");
        favoriteTools.style.display = "flex";
        myToolsSec.style.display = "none";
        break;
      case myToolsBtn:
        if (roleId == 1) {
          allToolsBtn.classList.remove("active");
          allTools.style.display = "none";
        }
        if (roleId == 2) {
          favoriteBtn.classList.remove("active");
          favoriteTools.style.display = "none";
        }
        myToolsBtn.classList.add("active");
        myToolsSec.style.display = "flex";
        break;
      case allToolsBtn:
        myToolsBtn.classList.remove("active");
        allToolsBtn.classList.add("active");
        allTools.style.display = "flex";
        myToolsSec.style.display = "none";
        break;
    }
  });
}

// myPageForms functionality
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
      const toolTitle = e.target[0].value;
      const toolDescription = e.target[1].value;
      const toolLink = e.target[2].value;
      const toolCategoryId = e.target[3].value;

      switch (e.target) {
        case submitTool:
          let postData = {
            userId: userId,
            toolTitle: toolTitle,
            toolDescription: toolDescription,
            toolLink: toolLink,
            toolCategoryId: toolCategoryId,
          };
          submitTool.querySelector(".btn").classList.add("loading");

          fetch(url + toolsEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "toolbox-token": localStorage.getItem("toolbox-token"),
            },
            body: JSON.stringify(postData),
          })
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              submitTool.querySelector(".btn").classList.remove("loading");
              notifications.innerHTML += `
              <span class="background-success text center box notification">Successfully added tool to toolbox!</span>
              `;
              setTimeout(() => {
                document.querySelector(".notification").remove();
              }, 5000);
            })
            .catch((error) => {
              console.error("Error:", error);
              notifications.innerHTML += `
              <span class="background-error text center box notification">Couldn't add tool to toolbox</span>
              `;
              setTimeout(() => {
                document.querySelector(".notification").remove();
              }, 5000);
            });
          break;
        case updateTool:
          updateData = {
            toolTitle: toolTitle,
            toolDescription: toolDescription,
            toolLink: toolLink,
            toolCategoryId: toolCategoryId,
          };

          fetch(url + toolsEndpoint + userId + "/" + toolToolId, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "toolbox-token": localStorage.getItem("toolbox-token"),
            },
            body: JSON.stringify(updateData),
          })
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              notifications.innerHTML += `
              <span class="background-success text center box notification">Successfully updated tool to toolbox!</span>
              `;
              setTimeout(() => {
                document.querySelector(".notification").remove();
              }, 5000);
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

if (myPageMain) {
  const userData = localStorage.getItem("userData");
  const userName = JSON.parse(userData).userName;
  const userId = JSON.parse(userData).userId;
  const userRole = JSON.parse(userData)["userRole"].roleId;


  // Letting the default be the member view, since if anything goes wrong 
  // the user wont have access to the delete buttons. 
  let myTools = `
  <section class="box flex column gap-1" id="myTools">
    <h2>${userName}'s page</h2>
    <section class="flex column gap-1">
    <div class="btn-container">
      <button id="favoriteToolsBtn" name="tabs" class="active">Favorite Tools</button>
      <button id="myToolsBtn" name="tabs">My Tools</button>
    </div>
    <div class="tools">
      <div class="skeleton">
        <article class="tool"></article>
      </div>
    </div>
    <div class="myToolsSec">
      <div class="skeleton">
        <article class="tool"></article>
      </div>
    </div>
  </section>
  `;
  if (userRole == 1) {
    myTools = `
  <section class="box flex column gap-1" id="myTools">
    <h2>${userName}'s page</h2>
    <section class="flex column gap-1">
      <div class="btn-container">
        <button id="allToolsBtn" name="tabs" class="active">All Tools</button>
        <button id="myToolsBtn" name="tabs">My Tools</button>
      </div>
      <div class="tools">
        <div class="skeleton">
          <article class="tool"></article>
        </div>
      </div>
      <div class="myToolsSec">
        <div class="skeleton">
          <article class="tool"></article>
        </div>
      </div>
    </section>
  </section>
  `;
  }

  const myPageSubmit = `
  <section class="myPageForms">
    <form id="submitTool" class="box">
      <h5>Submit a new tool:</h5>
      <label for="Stitel">title: 
        <input type="text" id="Stitel" name="Stitel" required>
      </label>
      <label for="Sdesc">description:
        <textarea id="Sdesc" name="Sdesc" rows="3" required></textarea>
      </label>
      <label for="Slink">link: 
        <input type="url" id="Slink" name="Slink" required pattern="https://.*">
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
      <button class="btn flex align-center" id="SnewTool">submit</button>
    </form>
  </section>
  `;

  // Rendering the submit form through js because the workaround for adding 
  // a new element before another one in the DOM is a pain.
  myPageMain.innerHTML += myTools;
  myPageMain.innerHTML += myPageSubmit;

  const myPageTools = document.querySelector(".tools");

  //  if admin get all tools
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
          <article class="tool withOptions" data-toolID="${tool.toolId}">
              <h5>${tool.toolTitle}</h5>
              <p>${tool.toolDescription}</p>
              <a href="${tool.toolLink}" target="_blank">visit tool..</a>
              <div class="options">
                <button class="update">update</button>
                <button class="delete">delete</button>
              </div>
              <input type="image" alt="" src="menu.svg" class="optionsBtn icon" />
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
      toolOptions();
  }

  // if member get favorite tools
  if (userRole == 2) {
    fetch(url + toolsEndpoint + favoritEndpoint + userId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "toolbox-token": localStorage.getItem("toolbox-token"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        removeSkeletons();
        data.forEach((tool) => {
          const toolHTML = `
        <article class="tool" data-id="${tool.toolId}">
            <h5>${tool.toolTitle}</h5>
            <p>${tool.toolDescription}</p>
            <a href="${tool.toolLink}" target="_blank">visit tool..</a>
            <input type="image" alt="" src="minus.svg" class="unfavorite icon" />
        </article>
        `;
          myPageTools.innerHTML += toolHTML;
        });
        unfavoriteBtn();
      })
      .catch((error) => {
        console.error("Error:", error);
        myPageTools.innerHTML = `
      <span class="flex center-flex">You don't have any favorite tools</span>
      `;
      });
  }

  const myToolsSec = document.querySelector(".myToolsSec");
  fetch(url + toolsEndpoint + creatorEndpoint + userId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "toolbox-token": localStorage.getItem("toolbox-token"),
    },
  })
    .then((response) => {
      if (response.status == 400) {
        myToolsSec.innerHTML = `
        <span class="flex center-flex">You haven't submitted any tools</span>
        `;
      }
      return response.json();
    })
    .then((data) => {
      data.forEach((tool) => {
        const toolHTML = `
        <article class="tool withOptions" data-toolID="${tool.toolId}">
            <h5>${tool.toolTitle}</h5>
            <p>${tool.toolDescription}</p>
            <a href="${tool.toolLink}" target="_blank">visit tool..</a>
            <div class="options">
              <button class="update">update</button>
            </div>
            <input type="image" alt="" src="menu.svg" class="optionsBtn icon" />
        </article>
        `;
        myToolsSec.innerHTML += toolHTML;
      });
      toolOptions();
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  myPageBtnContainer();
  updateAllmyPageForms();
}
