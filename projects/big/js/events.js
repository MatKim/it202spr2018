function getRecipe(event) {
    $("#piechart").empty();
    var currListElement = $(event.target);
    var recipeId = encodeURIComponent(currListElement.find("p").text());
    var recipeUrl = "https://api.edamam.com/search?r=" + recipeId +
        "&app_id=54ee2015&&app_key=fe1284c938e98fb97160403b45868e2c";
    console.log(recipeUrl);

    $.ajax({
        url: recipeUrl,
        type: "GET",
        dataType: "jsonp",
        success: function(response) {
            console.log(response);
            emptyRecipe();
            response = response[0];
            $("#search").hide();
            $("#search-result").hide();
            $("#location").hide();
            $("#recipe").show();
            $("#recipeTitle").text(response.label);
            $("#recipeImage").attr("src", response.image);
            $.each(response.ingredientLines, function(index, value) {
                var html = '<li class="mdc-list-item"><i class="material-icons">add_shopping_cart</i><span class="mdc-list-item__text">' +
                    value + '</span></li>';
                $("#ingredients").append(html);
            });
            $.each(response.healthLabels, function(index, value) {
                var html = '<li class="mdc-list-item"><i class="material-icons">remove</i><span class="mdc-list-item__text">' +
                    value + '</span></li>';
                $("#healthLabels").append(html);
            });
            $("#linkToRecipe").attr("href", response.url);
            $("#estimatedTime").text(response.totalTime + " minutes");
            var macros = [];
            $.each(response.totalNutrients, function(index, value) {
                var html = '<li class="mdc-list-item"> <span class="mdc-list-item__text">' +
                    value.label + '<span class="mdc-list-item__secondary-text">' +
                    +value.quantity + " " + value.unit + '</span></span></li>';
                $("#nutritionFacts").append(html);
                if (value.label === "Fat" || value.label === "Protein" || value.label === "Carbs") {
                    macros.push({ "label": value.label, "value": value.quantity })
                }
            });
            var pie = new d3pie("piechart", {
                "data": { "content": macros }
            });
            db.recipes.add({ label: response.label, url: currListElement.find("p").text() });
        },
        error: function(xhr, status, error) {
            console.log("ERROR")
        }
    });
}

function emptyRecipe() {
    document.getElementById("recipeImage").src = "";
    $("#ingredients, #healthLabels, #estimatedTime, #nutritionFacts").empty();
}


$(document).ready(function() {
    $("#search-result").hide();
    $("#recipe").hide();
    $("#location").hide();
    $("#searchButton").click(function() {
        console.log("WE SEARCHIN")
        $("#resultList").empty();
        $("resultList").show();
        var url = "https://api.edamam.com/search?q=" + $("#search-field").val() +
            "&app_id=54ee2015&&app_key=fe1284c938e98fb97160403b45868e2c&from=0&to=30";
        console.log(url);
        $.ajax({
            url: url,
            dataType: "json",
            success: function(response) {
                $("#search").hide();
                $("#search-result").show();
                if (response.count == 0) {
                    console.log("ERROR");
                    var html = '<li class="mdc-list-item"> <span class="mdc-list-item__text">No search results found</span></li>';
                    $("#resultList").append(html);
                    return;
                }
                console.log("got the response");
                console.log(response);
                $.each(response.hits, function(index, value) {
                    var calories = Math.floor(value.recipe.calories);
                    var html = '<li class="mdc-list-item recipeitem"> <span class="mdc-list-item__text">' +
                        value.recipe.label + '<p hidden>' + value.recipe.uri + '</p>' +
                        '<span class="mdc-list-item__secondary-text">' +
                        "Calories:" + calories + '</span></span></li>';

                    $("#resultList").append(html);
                });
                $("#results").on("click", "li", getRecipe);
            },
            error: function() {
                console.log("ERROR");
                var html = '<li class="mdc-list-item"> <span class="mdc-list-item__text">No search results found</span></li>';
                $("#resultList").append(html);
            }
        });

    });

    $("#backToSearch").click(function() {
        $("#search-result").hide();
        $("#search").show();
        getHistory()
    });
    $("#backToRecipes").click(function() {
        $("#recipe").hide();
        $("#search-result").show();
    });
    $("#clearButton").click(function(){
        db.recipes.clear();
        getHistory();
    });
});
