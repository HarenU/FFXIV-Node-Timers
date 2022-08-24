// Code to get current eorzean time
// CREDIT FOR EORZEAN CLOCK GOES TO USER 'jryansc'
// Code can be found here: http://jsfiddle.net/jryansc/6r85j/

var E_TIME = 20.5714285714;
var global = {
    utcTime: null,
    eorzeaTime: null
};
window.setInterval(updateClock, Math.floor(1000 * 60 / E_TIME));

function updateClock() {
    global.utcTime = new Date().getTime();
    var eo_timestamp = Math.floor(global.utcTime * E_TIME);
    global.eorzeaTime = new Date();
    global.eorzeaTime.setTime(eo_timestamp);
    showTime();
}

function showTime() {
    var d = new Date();
    d.setTime(global.eorzeaTime);
    var eTime = document.getElementById('e-time');
    var hours = d.getUTCHours();
    var ampm = hours > 11 ? "PM" : "AM";
    if (hours > 12)
        hours -= 12;
    hours = padLeft(hours);
    var minutes = d.getUTCMinutes();
    minutes = padLeft(minutes);
    eTime.innerHTML = hours + ":" + minutes + " " + ampm;
}
function padLeft(val) {
    var str = "" + val;
    var pad = "00";
    return pad.substring(0, pad.length - str.length) + str;
}
updateClock();

// populate Table with Json data
// JSON data supplied from https://github.com/9001-Solutions/ffxivclock-data#readme

function filterById(jsonObject, id) { return jsonObject.filter(function (jsonObject) { return (jsonObject['id'] == id); })[0]; }

var item

$(document).ready(function () {
    getItemIDList()
    var item
    //Loading in Item data
    $.getJSON("items.json", function (data) {
        item = data
    })
    $.getJSON("nodes.json", function (data) {
        // console.log(data.nodes);

        var entry = '';

        $.each(data.nodes, function (key, value) {

            for (let i = 0; i < value.itemIds.length; i++) {
                var selectedItem = filterById(item['items'], value.itemIds[i])

                entry += '<tr>'
                entry += '<td class="type">' +
                    value.type + '</td>'

                entry += '<td class="item-name">' +
                    selectedItem.name + '</td>'
                entry += '<td class="item-level">' +
                    selectedItem.level + '</td>'

                entry += '<td class="start-time">' +
                    value.startTime + '</td>'
                entry += '<td class="end-time">' +
                    value.endTime + '</td>'

                entry += '<td class="zone">' +
                    value.zone + '</td>'

                entry += '<td class="teleport">' +
                    value.teleport + '</td>'
                if (value.position === "unknown") {
                    entry += '<td class="position">' + "unknown" + `</td>`
                } else {
                    entry += '<td class="position">' +
                        `(${value.position.x}, ${value.position.y})` + '</td>'
                }


                entry += '<td class="node-ID" style="display:none;">' +
                    value.id + '</td>'
                entry += '<td class="item-ID" style="display:none;">' +
                    selectedItem.id + '</td>'

                entry += '</tr>'

            }

        });

        $('#node-table').append(entry)
        tableColourUpdate()
    })
})

// Populate Grid with Saved data

function filterById(jsonObject, id) { return jsonObject.filter(function (jsonObject) { return (jsonObject['id'] == id); })[0]; }

var item

$(document).ready(function () {

    //Loading in data

    var savedItems = JSON.parse(window.localStorage.getItem('trackedItem'))


    var entry = '';

    for (let i = 0; i < savedItems.length; i++) {
        const element = savedItems[i];


        entry += '<div class="saved-node">'
        entry += `<div class="node-name"> Name: ${element.item.name} </div>`
        entry += `<div class="node-level"> Level: ${element.item.level} </div>`
        entry += `<div class="node-description"> Description: ${element.item.description} </div>`
        entry += `<div class="node-time"> Time: ${element.node.startTime} - ${element.node.endTime}</div>`
        entry += '</div>'
    }

    $('#saved-node-container').append(entry)
})

$('#node-table > tbody > tr').each(function () {
    console.log("hi");
})

// Save Data by clicking on row
// TODO: unspaghettify this
$('#node-table').on('click', function (e) {

    var savedItem = $(e.target).closest('tr').find(".item-ID").html();
    var savedNode = $(e.target).closest('tr').find(".node-ID").html();

    var selectedItem
    var selectedNode


    $.getJSON("items.json", function (data) {
        for (let i = 0; i < data.items.length; i++) {
            var element = data.items[i];
            if (savedItem == element.id) {
                selectedItem = element;
                $.getJSON("nodes.json", function (data) {
                    for (let i = 0; i < data.nodes.length; i++) {
                        var element = data.nodes[i];
                        if (savedNode == element.id) {
                            selectedNode = element
                            saveData(selectedItem, selectedNode)
                        }
                    }
                })
            }
        }
    })
})



function saveData(item, node) {
    itemList = []
    trackedItems = { item: item, node: node }

    var currentItems = window.localStorage.getItem('trackedItem')
    // Check if local Storage variable exists, if not initilizes storage variable
    if (!currentItems) {

        itemList.push(trackedItems)
        window.localStorage.setItem('trackedItem', JSON.stringify(itemList));
    } else {
        itemList = (JSON.parse(currentItems));

        var exists = false
        for (let i = 0; i < itemList.length; i++) {
            const element = itemList[i];
            if (element.item.id == trackedItems.item.id) {
                exists = true
            }
        }
        // check to see if it exists, if so, removes data
        if (exists) {
            var index
            for (let i = 0; i < itemList.length; i++) {
                if (trackedItems.item.id == itemList[i].item.id) {
                    index = i
                }
            }
            itemList.splice(index, 1)

            window.localStorage.setItem('trackedItem', JSON.stringify(itemList));
        } else {
            itemList.push(trackedItems)
            window.localStorage.setItem('trackedItem', JSON.stringify(itemList));
        }

    }
    updateCount()
    tableColourUpdate()
}


//Search Function
$(document).ready(function () {
    $("#node-search").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#node-table>tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});


//Counter for page

$(document).ready(function () {
    updateCount()

});

function updateCount() {
    var count = 0
    var currentItems = JSON.parse(window.localStorage.getItem('trackedItem'))

    for (let i = 0; i < currentItems.length; i++) {
        count++
    }
    $("#saved-nodes").text(`Saved Nodes: ${count}`)

}


//get ItemList
function getItemIDList() {
    var savedList = []
    var currentItems = JSON.parse(window.localStorage.getItem('trackedItem'))
    for (let i = 0; i < currentItems.length; i++) {
        const element = currentItems[i];
        savedList.push(element.item.id)
    }
    return savedList
}

//get NodeList
function getNodeIDList() {
    var savedList = []
    var currentItems = JSON.parse(window.localStorage.getItem('trackedItem'))
    for (let i = 0; i < currentItems.length; i++) {
        const element = currentItems[i];
        savedList.push(element.node.id)
    }
    return savedList
}


// Updating Colour if row is saved
function tableColourUpdate() {
    var currentItemList = getItemIDList()
    var currentNodeList = getNodeIDList()
    $("#node-table > tr").each(function () {
        if (currentItemList.includes($(this).find(".item-ID").html())) {
            if (currentNodeList.includes($(this).find(".node-ID").html())) {
                console.log("saved");
                $(this).toggleClass(
                    $(this).css("background-color", "red")
                )

            }
        }


    });
}

$("#node-table>tr").click(function () {
    console.log("this");
});