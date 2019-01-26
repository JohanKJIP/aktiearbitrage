$(document).ready(function() {
    getListItems("", "");
});

/**
 * Function iterate and append list item.
 */
function renderListItems(stockList) {
    var container = $("#table-body");
    for (var key in stockList) {
        // check if the property/key is defined in the object itself, not in parent
        if (stockList.hasOwnProperty(key)) {        
            var itemdiv = "<tr> \
                    <td class=\"name\">" + key + "</td> \
                    <td class=\"type\">" + stockList[key]['type1'].type + ": " + stockList[key]['type1'].latest_price + "</td> \
                    <td class=\"type\">" + stockList[key]['type2'].type + ": " + stockList[key]['type2'].latest_price + "</td> \
                    <td class=\"spread\">" + stockList[key].spread + "%</td> \
                    </tr>"
            container.append(itemdiv);
        }
    }
}

/**
 * Function that changes the sorting order of the list (table).
 */
function changeSort(type) {
    var table = $("#table-body");
    // reverse the type
    if (type === "name") {
        if (table.attr("sort") === "name") {
            table.attr("sort", "-name");
        } else if (table.attr("sort") === "-name" || (table.attr("sort") === "spread" || table.attr("sort") === "-spread")) {
            table.attr("sort", "name");
        }
    } 
    if (type === "spread") {
        if (table.attr("sort") === "spread") {
            table.attr("sort", "-spread");
        } else if (table.attr("sort") === "-spread" || (table.attr("sort") === "name" || table.attr("sort") === "-name")) {
            table.attr("sort", "spread");
        }
    } 
    updateSearchResult();
}

/**
 * Retrieve stocks from database, based on query and sorting method.
 */
function getListItems(query, sort) {
    $.ajax({
        url: 'ajax/get_stock_list',
        datatype: 'json',
        data : {
            'query': query,
            'sort': sort
        },
        type: 'GET',
        success: function(data) {
            renderListItems(data);
        }
    });
}

function updateSearchResult() {
    input = $("#search").val();
    table = $("#table-body");
    // either sort by name or spread
    sort = table.attr("sort");
    $("#table-body").empty();
    getListItems(input, sort);
}