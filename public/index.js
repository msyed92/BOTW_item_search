$("#category").on("input", function () {
  var $category = this.value;

  $.getJSON("https://botw-compendium.herokuapp.com/api/v2", function (data) {
    var all = data.data;
    var key = $category;
    var vals = [];
    var array;

    switch (key) {
      case "Select/Random":
        array = [
          ...all.creatures.food,
          ...all.creatures.non_food,
          ...all.equipment,
          ...all.materials,
          ...all.treasure,
          ...all.monsters,
        ];
        break;
      case "creatures":
        var food = all.creatures.food;
        var non_food = all.creatures.non_food;
        array = [...food, ...non_food];
        break;
      case "equipment":
        array = all.equipment;
        break;
      case "materials":
        array = all.materials;
        break;
      case "treasure":
        array = all.treasure;
        break;
      case "monsters":
        array = all.monsters;
        break;
    }

    for (let i = 0; i < array.length; i++) {
      if (!!array[i]["common_locations"]) {
        let locsArray = array[i]["common_locations"];
        for (let j = 0; j < locsArray.length; j++) {
          vals.push(locsArray[j]);
        }
      }
    }
    vals = vals.filter((v, i, a) => a.indexOf(v) === i);

    var $location = $("#locations");
    $location.empty();
    $location.append(`<option value="Select/Random"></option>`);
    $.each(vals, function (index, value) {
      let option = `<option value="` + value + `"></option>`;
      $location.append(option);
    });
  });
});
