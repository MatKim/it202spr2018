var db = new Dexie("SelectedRecipes");
db.version(1).stores({
    recipes: "++id, label, url"
});

function getHistory() {
    console.log("Get previous recipes")
    $("#history").empty();
    db.recipes.each(function(recipe) {
        console.log(recipe);
        var html = '<li class="mdc-list-item prev-recipe"> <span class="mdc-list-item__text">' +
            recipe.label + '<p hidden>' + recipe.url + '</p>' + '</span></li>'
        $("#history").append(html);
    }).catch(err => {
        console.error("gang gang gang gang: " + err.stack);
    });
    $("#history").on("click", "li", getRecipe);
}
