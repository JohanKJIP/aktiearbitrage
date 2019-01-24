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
                    <p class=\"name\">" + stockList[key] + "</p> \
                    </div>"
            container.append(itemdiv);
        }
    }
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