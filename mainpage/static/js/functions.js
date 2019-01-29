$(document).ready(function() {
    // Initial list load when entering page
    var page = window.location.pathname;
    if(page == '/' || page == '/default.aspx'){
        updateSearchResult();
    } else if(page.startsWith('/stocks/')) {
        loadStockDetails();
    }

    /**
     * Redirect user on table row click.
     */
    $(document).on("click", ".table-row", function() {
        var stock = $(this).find(".name").attr("slug");
        window.location.href = '/stocks/' + stock;
    })
});

function loadStockDetails() {
    var stockName = $("#stock-name").text();
    $.ajax({
        url: '/ajax/get_stock_data/',
        datatype: 'json',
        data : {
            'name': stockName
        },
        type: 'GET',
        success: function(data) {
            loadGraph(stockName, data);
        }
    });
}

function loadGraph(stockName, data) {
    // get request for data
    var ctx = $("#stock-chart");
    console.log("Loading chart...");
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050],
            datasets: [{ 
                data: [86,114,106,106,107,111,133,221,783,2478],
                label: stockName + " " + data['type1'],
                borderColor: "#3e95cd",
                fill: false
            }, { 
                data: [282,350,411,502,635,809,947,1402,3700,5267],
                label: stockName + " " + data['type2'],
                borderColor: "#8e5ea2",
                fill: false
            }
          ]
        },
        options: {
            title: {
                display: true,
                text: 'Aktiekurser'
            }
        }
    });      
}

/**
 * Function iterate and append list item.
 */
function renderListItems(stockList) {
    var container = $("#table-body");
    var html = ""
    for (var key in stockList) {
        // check if the property/key is defined in the object itself, not in parent
        if (stockList.hasOwnProperty(key)) {        
            var itemdiv = "<tr class=\"table-row\"> \
                    <td class=\"name column1\" slug=\"" + key + "\">" + stockList[key].name + "</td> \
                    <td class=\"type column2\">" + stockList[key]['type1'].latest_price + "</td> \
                    <td class=\"type column3\">" + stockList[key]['type2'].latest_price + "</td> \
                    <td class=\"spread column4\">" + stockList[key].spread + "%</td> \
                    </tr>"
            html += itemdiv;
        }
    }
    container.html(html);
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
    getListItems(input, sort);
}