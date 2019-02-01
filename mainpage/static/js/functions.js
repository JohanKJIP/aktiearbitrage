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

    $(document).ready(function() {
        $('li.active').removeClass('active');
        $('a[href="' + location.pathname + '"]').closest('li').addClass('active'); 
    });
});

/**
 * Method to load stock details on stock page.
 * Retrieves data from database via GET.
 */
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

/**
 * Function to load the graph from database data.
 */
function loadGraph(stockName, data) {
    // get request for data
    var ctx = $("#stock-chart");
    var type1Dataset = rawDataToDatapoints(data['type1_prices']);
    var type2Dataset = rawDataToDatapoints(data['type2_prices']);

    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{ 
                data: type1Dataset,
                label: stockName + " " + data['type1'],
                borderColor: "#2b8cbe",
                fill: false
            }, { 
                data: type2Dataset,
                label: stockName + " " + data['type2'],
                borderColor: "#e41a1c",
                fill: false
            }
          ]
        },
        options: {
            title: {
                display: true,
                text: 'Aktiekurser'
            },
            elements: {
                line: {
                    tension: 0
                }
            },
            fill: false,
            responsive: true,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day',
                        unitStepSize: 1,
                        displayFormats: {
                           'day': 'MMM DD'
                        }
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Datum",
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Kurspris (kr)",
                    }
                }]
            }
        }
    });      
}

/**
 * Function to turn raw db data into datapoints for chart.js
 * @param {*} data 
 */
function rawDataToDatapoints(data) {
    var datapoints = [];
    for (let i = 0; i < data.length; i++) {
        const datapoint = data[i];
        var price = datapoint.stock_price;
        var date = datapoint.date;
        datapoints.push({x: date, y:price});
    }
    return datapoints;
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
            var itemdiv = "<tr class=\"table-row noselect\"> \
                    <td class=\"name column1\" slug=\"" + key + "\">" + stockList[key].name + "</td> \
                    <td class=\"type column2\">" + stockList[key]['type1'].latest_price + "</td> \
                    <td class=\"type column3\">" + stockList[key]['type2'].latest_price + "</td> \
                    <td class=\"spread column4 green\">+" + stockList[key].spread + "%</td> \
                    </tr>"
            html += itemdiv;
        }
    }
    if (!(Object.keys(stockList).length === 0)) {
        container.html(html);
    } else {
        container.html("<td class=\"text-center\">Din sökning gav inget resultat...</td>")
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

function updateSearchResult() {
    var page = window.location.pathname;
    if(page == '/' || page == '/default.aspx') {
        input = $("#search").val();
        table = $("#table-body");
        // either sort by name or spread
        sort = table.attr("sort");
        getListItems(input, sort);
    } else {
        // TODO auto complete search result and go to stock page
    }
}

/**
 * When hamburger menu pressed remove fixed attribute to navbar
 * since it covers large portion of the screen.
 */
function moveTable() {
    var expanded = $("#bar").attr("aria-expanded");
    if (expanded === 'false' || expanded === undefined) {
        $("#table-title").css("margin-top", "0px");
        $("#navbar-parent").removeClass("navbar-fixed-top");
    } else if (expanded === 'true') {
        $("#table-title").css("margin-top", "100px");
        $("#navbar-parent").addClass("navbar-fixed-top");
    }   
}
 
/**
 * Sort the table.
 */
function sortTable(column) {
    var table = $("#list-group > tbody");
    var i = 1;

    var sortType = $("#list-group").attr("sort-type");

    if(sortType === "ASC") {
        sortType = "DESC";
        $("#list-group").attr("sort-type", "DESC");
    } else if(sortType === "DESC") {
        sortType = "ASC";
        $("#list-group").attr("sort-type", "ASC");
    }  

    var switching = true;
    while (switching) {
        switching = false;
        var rows = table.find("tr");
        for(i = 0; i < rows.length-1; i++) {
            shouldSwitch = false;
            var t1 = rows[i].getElementsByTagName("td")[column];
            var t2 = rows[i+1].getElementsByTagName("td")[column]; 
            var t1value = tableCellFormat(t1);  
            var t2value = tableCellFormat(t2);

            if (sortType === "ASC"){
                if (t1value > t2value) {                
                  shouldSwitch = true;
                  break;                
                }                                        
            }       
            if (sortType === "DESC") {
                if (t1value < t2value) {                
                  shouldSwitch = true;
                  break;                
                }                    
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

/**
 * Function takes a cell value and returns int or string in lowercase
 * depending on the input.
 * @param {string} cell 
 */
function tableCellFormat(cell) {
    if (!Object.is(parseInt(cell.innerHTML), NaN)) {
        return parseInt(cell.innerHTML);
    }
    if(typeof cell.innerHTML === "string") {
        return cell.innerHTML.toLowerCase();
    }    
}