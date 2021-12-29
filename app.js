import express from "express";
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
  let userInputCategory = true;
  let userInputLocation = true;
  if (category == "Select/Random" || !category) {
    userInputCategory = false;
  } else {
    url += "/category/" + category;
  }
  if (location == "Select/Random" || !location) {
    userInputLocation = false;
  }
  https.get(url, function (response) {
    let categoryStr = "";

    response.on("data", function (data) {
      categoryStr += data;
    });

    response.on("end", function () {
      //get JSON from url
      let categoryData = JSON.parse(categoryStr).data;

      //set array based on category
      function categoryFilter(cat) {
        let array;
        if (cat == "Select/Random" || userInputCategory == false) {
          cat = chooseNewCategory();
          array = categoryData[cat];
        } else {
          array = [...categoryData];
        }
        if (cat == "creatures") {
          let type = chooseCreatureType();
          array = array[type];
        }
        return {
          category: cat,
          array: array,
        };
      }

      //reset values based on filter
      let categoryObj = categoryFilter(category);
      category = categoryObj.category;
      let categoryArray = categoryObj.array;

      //array of locations that are available for that category

      //filter out items in the category that match the location
      function filterOnLocation(array, loc) {
        let locations = [];
        for (let i = 0; i < array.length; i++) {
          let loc_ = array[i].common_locations;
          if (!!loc_) {
            for (let j = 0; j < loc_.length; j++) {
              locations.push(loc_[j]);
            }
          }
        }
        locations = locations.filter((v, i, a) => a.indexOf(v) === i);
        if (locations.includes(loc)) {
          let newArray = array.filter(function (arr) {
            return !!arr.common_locations && arr.common_locations.includes(loc);
          });
          return { arr: newArray, location: loc };
        } else {
          if (userInputCategory == false) {
            category = chooseNewCategory();
            let newObj = categoryFilter(category);
            array = newObj.array;
            category = newObj.category;
          }
          if (userInputLocation == false) {
            loc = locations[Math.floor(Math.random() * locations.length)];
          }
          return filterOnLocation(array, loc);
        }
      }

      let newCatObj = filterOnLocation(categoryArray, location);
      categoryArray = newCatObj.arr;
      location = newCatObj.location;

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

app.listen(process.env.PORT || 3000, function () {
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

  let item = itemTypes[Math.floor(Math.random() * itemTypes.length)];

  return item;
}

function chooseCreatureType() {
  const creatureTypes = ["food", "non_food"];
  let type = creatureTypes[Math.floor(Math.random() * creatureTypes.length)];
  return type;
}
