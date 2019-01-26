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
        $("#table-body").empty();
        getListItems(input, "");
    }
}