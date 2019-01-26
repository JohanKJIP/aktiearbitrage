$(document).ready(function() {
    getListItems("", "");
});

/**
 * Function iterate and append list item.
 */
function renderListItems(stockList) {
    var container = $("#list-group");
    for (var key in stockList) {
        // check if the property/key is defined in the object itself, not in parent
        if (stockList.hasOwnProperty(key)) {        
            var itemdiv = "<div class=\"list-group-item align-items-center\"> \
                    <p class=\"name\">" + key + "</p> \
                    <p class=\"type\">" + stockList[key]['type1'].type + ": " + stockList[key]['type1'].latest_price + "</p> \
                    <p class=\"type\">" + stockList[key]['type2'].type + ": " + stockList[key]['type2'].latest_price + "</p> \
                    <p class=\"number\">" + stockList[key].spread + "</p> \
                    </div>"
            container.append(itemdiv);
        }
    }
}

/**
 * Retrieve stocks from database, based on query and sorting method.
 */
function getListItems(query, sort) {
    console.log("Getting list items")
    $.ajax({
        url: 'ajax/get_stock_list',
        datatype: 'json',
        data : {
            'query': query,
            'sort': sort
        },
        type: 'GET',
        success: function(data) {
            console.log("Success!")
            renderListItems(data);
        }
    });
}

function updateSearchResult() {
    input = $("#search").val();
    console.log(input);
    if (input.length > 0) {
        $("#list-group").empty();
        getListItems(input, "");
    }
}