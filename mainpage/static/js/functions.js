$(document).ready(function() {

    // Set up ajax.
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        }
    });

    // Initial list load when entering page
    var page = window.location.pathname;
    if(page == '/' || page == '/default.aspx'){
        updateSearchResult();
    } else if(page.startsWith('/stocks/')) {
        loadStockDetails();
    } else if(page.startsWith('/my_list/')) {
        loadMyList();
    } else if(page.startsWith('/my_page/')) {
        loadMyPage();
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
 * Loads the list based on user favourites.
 */
function loadMyList() {
    if (true) {
        $("#list-group").replaceWith("<p><a href=\"/my_page/\">Din lista är tom, klicka här för att redigera!</a></p>");
    }
    //$("#my-list-table").html("<a href=\"/my_page/\">Din lista är tom, klicka här för att redigera!</a>");
}

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
            loadTable(stockName, data);
        }
    });
}

/**
 * Loads the table on detailed stock page.
 */
function loadTable(stockName, data) {
    var type1Spread = getSpreadString(parseFloat(data['type1_latest_price']), parseFloat(data['type2_latest_price']));
    var type2Spread = getSpreadString(parseFloat(data['type2_latest_price']), parseFloat(data['type1_latest_price']));

    html = generateTable(stockName, data, 'type1', type1Spread);
    $("#type1-info").html(html);
    html = generateTable(stockName, data, 'type2', type2Spread);
    $("#type2-info").html(html);
}

/**
 * Generates the table seen on detailed stock page.
 * @param {string} stockName 
 * @param {dictionary} data 
 * @param {string} type 
 * @param {float} spread 
 */
function generateTable(stockName, data, type, spread) {
    var html = "<td>"  + stockName + " "  + data[type] + "</td>";
    html += "<td class=\"noselect clickable\"><a class=\"button\" href=" + data[type + '_url'] + ">Köp</a></td>";
    html += "<td class=\"table-cell-number\">"  + parseFloat(data[type + '_latest_price']).toFixed(2) + " kr </td>";
    html += "<td class=\"table-cell-number " + positiveOrNegativeClass(spread) + "\">"  + spread + "</td>";
    html += "<td class=\"table-cell-number " + positiveOrNegativeClass(spread) + "\">"  + "-10%" + "</td>";
    html += "<td class=\"table-cell-number " + positiveOrNegativeClass(spread) + "\">"  + "-12%" + "</td>";
    html += "<td class=\"table-cell-number\">"  + data[type + '_vol'] + "</td>";
    return html;
}

/**
 * Used to determine colour of number w/ class and css.
 */
function positiveOrNegativeClass(number) {
    if (typeof number === 'string') {
        number.replace("%", "");
        number.replace("+", "");
        number.replace("-", "");
        number = parseFloat(number);
    }
    if(number >= 0) return "positive";
    return "negative";
}

/**
 * Calculate spread from two prices.
 * price1 is after, price2 is before, e.g. 10 -> 9 = -10%, 9 -> 10 = +11%
 * @param {float} price1 
 * @param {float} price2 
 */
function getSpreadString(price1, price2) {
    var spread = (((price1-price2)/price2)*100).toFixed(2);
    if (spread >= 0) {
        return "+" + spread + "%";
    } else {
        return spread + "%"; 
    }
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
                    <td class=\"spread column4 positive\">+" + stockList[key].spread + "%</td> \
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
        url: '/ajax/get_stock_list',
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


/**
 * Fix search results, retrieve values from db and populate.
 */
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

/**
 * Function to save fee settings
 */
function saveCourtage() {
    var lowestFee = $("#lowest-fee");
    var lowestFeeValue = checkFloatInput(lowestFee[0]);

    var variableFee = $("#variable-fee");
    var variableFeeValue = checkFloatInput(variableFee[0]);

    if (!isNaN(lowestFeeValue) && !isNaN(variableFeeValue)) {
        $.ajax({
            url: '/ajax/save_courtage',
            datatype: 'json',
            data : {
                lowest_fee: lowestFeeValue,
                variable_fee: variableFeeValue
            },
            type: 'POST',
            success: function(data) {
                $("#success-tag").html("<p>Inställningar sparade</p>")
            },
            error: function(data) {
                $("#success-tag").html("<p>Ett fel uppstod!</p>")
            }
        });
    }
}

/**
 * Checks if input is float, takes DOM input element.
 */
function checkFloatInput(element) {
    var elementValue = parseFloat(element.value);
    if (isNaN(elementValue) && element.value !== "" || elementValue<0) {
        element.classList.add("input-error");
    }  else {
        element.classList.remove("input-error");
    }
    return elementValue;
}

/**
 * Get a cookie by name
 * @param {string} name 
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Make necessary loads for the page "my page"
 */
function loadMyPage() {
    getUserProfile().then(function(data) {
        // fee box
        $("#lowest-fee").val(data['minimum_fee']);
        $("#variable-fee").val(data['variable_fee']);

        // owned stocks list
        var tbody = $("#my-page-stock-table tbody");
        $.ajax({
            url: '/ajax/get_user_stock_list',
            datatype: 'json',
            type: 'GET',
            success: function(data) {
                generateTableRows(data);
            },
        });
        // TODO generate t-rows
    })
}

function generateTableRows(data) {
    var tbody = $("#my-page-stock-table tbody");
    for (var key in data) {
        var html = "<tr> <td>" + key + "</td>";
        html += "<td class=\"table-cell-number\">" + data[key]['amount'] + "</td>";
        html += "<td class=\"table-cell-number\">" + data[key]['price'] + "</td>";
        html += "<td><i class=\"fa fa-edit icon clickable\" onclick=\"editStockListItem(this)\"></i></td>";
        html += "<td><i class=\"fa fa-trash icon clickable\" onclick=\"deleteStockListItem(this)\"></i></td>";
        html += "</tr>";
        tbody.append(html);
    }
}

function deleteStockListItem(button) {
    if(confirm("Är du säker att du vill ta bort raden?")) {
        var row = button.parentNode.parentNode;
        var name = row.children[0].innerHTML;
        row.remove();
        $.ajax({
            url: '/ajax/delete_user_list_item/',
            data:  {
                name:name
            },
            type: 'POST',
        });
    }
}

function editStockListItem(button) {
    var trChildren = button.parentNode.parentNode.children;
    var stock = trChildren[0].innerHTML;
    var amount = trChildren[1].innerHTML;
    var price = trChildren[2].innerHTML;
    console.log(stock);
    console.log(amount);
    console.log(price);
}

function addStockListItem() {
    var html = "<tr> <td> <input id=\"my-list-stock\" type=\"text\" autocomplete=\"off\" name=\"stock\" onkeyup=\"\" value=\"Handelsbanken A\"> </td>";
    html += "<td class=\"table-cell-number\"> <input id=\"my-list-amount\" type=\"text\" autocomplete=\"off\" align=\"right\" name=\"stock\" onkeyup=\"checkFloatInput(this)\" value=\"0\"> </td>";
    html += "<td class=\"table-cell-number\"> <input id=\"my-list-price\" type=\"text\" autocomplete=\"off\" align=\"right\" name=\"stock\" onkeyup=\"checkFloatInput(this)\" value=\"0\"> </td>";
    html += "<td><i class=\"fa fa-save icon clickable\" onclick=\"saveStockListItem(this)\"></i></td>";
    html += "<td><i class=\"fa fa-trash icon clickable\" onclick=\"deleteStockListItem(this)\"></i></td>";
    html += "</tr>";
   $("#my-page-stock-table tbody").append(html); 
}

function saveStockListItem(element) {
    var row = element.parentNode.parentNode;
    var tds = row.children;
    // TODO check input??
    var stock = tds[0].children[0].value;
    var amount = tds[1].children[0].value;
    var price = tds[2].children[0].value;
    // local change
    tds[0].children[0].replaceWith(stock);
    tds[1].children[0].replaceWith(amount);
    tds[2].children[0].replaceWith(price);
    // remote db change
    $.ajax({
        url: '/ajax/save_stock_list_item/',
        datatype: 'json',
        data : {
            stock: stock,
            amount: amount,
            price: price
        },
        type: 'POST',
        success: function(data) {
            //$("#success-tag").html("<p>Inställningar sparade</p>")
        },
        error: function(data) {
            //$("#success-tag").html("<p>Ett fel uppstod!</p>")
        }
    });
}

/**
 * Get the users profile.
 */
function getUserProfile() {
    return $.ajax({
        url: '/ajax/get_profile',
        datatype: 'json',
        type: 'GET'
    });
}

function hidePopup(name) {
    $("#" + name).addClass("hidden");
}