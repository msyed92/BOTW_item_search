import express from "express";
import request from "request";
import { dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let displayItem = {
  name: "name",
  category: "category",
  img: "zelda.png",
  desc: "description",
  loc: "location",
};

app.post("/", (req, res) => {
  let category = req.body.category;
  let location = req.body.location;
  let url = "https://botw-compendium.herokuapp.com/api/v2";
  let userInputCategory;
  if (category == "Select/Random" || !category) {
    userInputCategory = false;
  } else {
    url += "/category/" + category;
    userInputCategory = true;
  }
  https.get(url, function (response) {
    let categoryStr = "";

    response.on("data", function (data) {
      categoryStr += data;
    });

    response.on("end", function () {
      let categoryData = JSON.parse(categoryStr).data;

      function categoryFilter(category) {
        let categoryArray;
        if (category == "Select/Random" || !category) {
          category = chooseNewCategory();
          categoryArray = categoryData[category];
          userInputCategory = false;
        }
        if (category == "creatures") {
          let type = chooseCreatureType();
          if (userInputCategory == false) {
            categoryArray = categoryData[category][type];
          } else {
            categoryArray = categoryData[type];
          }
        } else if (userInputCategory == true) {
          categoryArray = [...categoryData];
        }
        return {
          category: category,
          array: categoryArray,
          input: userInputCategory,
        };
      }
      let categoryArray = categoryFilter(category).array;
      category = categoryFilter(category).category;
      userInputCategory = categoryFilter(category).input;

      let locations = [];
      for (let i = 0; i < categoryArray.length; i++) {
        let loc = categoryArray[i].common_locations;
        if (!!loc) {
          for (let j = 0; j < loc.length; j++) {
            locations.push(loc[j]);
          }
        }
      }
      locations = locations.filter((v, i, a) => a.indexOf(v) === i);

      while (!!location) {
        if (locations.includes(location)) {
          let newArray = categoryArray.filter(function (arr) {
            return (
              !!arr.common_locations && arr.common_locations.includes(location)
            );
          });
          categoryArray = [...newArray];
          break;
        } else if (userInputCategory == false) {
          category = chooseNewCategory();
          categoryArray = categoryFilter(category);
        } else {
          location = locations[Math.floor(Math.random() * locations.length)];
        }
      }

      console.log(category);
      console.log(location);

      let random = Math.floor(Math.random() * categoryArray.length);
      let item = categoryArray[random];

      Object.assign(displayItem, {
        name: item.name,
        category: item.category,
        img: item.image,
        loc: item.common_locations,
        desc: item.description,
      });
    });

    res.redirect("/display");
  });
});

app.get("/api", (req, res) => {
  res.json(displayItem);
});

app.get("/display", (req, res) => {
  res.sendFile(__dirname + "/display.html");
});

app.post("/display", (req, res) => {
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("server is running on port 3000");
});

function chooseNewCategory() {
  const itemTypes = [
    "creatures",
    "monsters",
    "equipment",
    "materials",
    "treasure",
  ];

  return itemTypes[Math.floor(Math.random() * itemTypes.length)];
}

function chooseCreatureType() {
  const creatureTypes = ["food", "non_food"];
  return creatureTypes[Math.round(Math.random())];
}
