async function fetchUserData() {
  try {
    let response = await fetch("/api");
    let data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

(async function () {
  let data = await fetchUserData();
  document.querySelector(".name").innerHTML = data.name;
  let cat = data.category;
  let checkPlural = cat.charAt(cat.length - 1) == "s" ? true : false;
  if (checkPlural) {
    cat = cat.slice(0, -1);
  }
  document.querySelector(".category").innerHTML = cat;
  document.querySelector(".img").src = data.img;
  document.querySelector(".img").width = 200;
  document.querySelector(".img").height = 200;
  document.querySelector(".desc").innerHTML = data.desc;
  document.querySelector(".loc").innerHTML = data.loc;
})();
