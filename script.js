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

    hours = padLeft(hours);
    var minutes = d.getUTCMinutes();
    minutes = padLeft(minutes);
    eTime.innerHTML = hours + ":" + minutes;
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
    $.getJSON("./data/items.json", function (data) {
        item = data
    })
    $.getJSON("./data/nodes.json", function (data) {
        // console.log(data.nodes);

        var entry = '';

        $.each(data.nodes, function (key, value) {

            for (let i = 0; i < value.itemIds.length; i++) {
                var selectedItem = filterById(item['items'], value.itemIds[i])

                entry += '<tr class="node-data-row">'
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

        tableColourSet()
        updateSavedColour()
        console.log("loaded");
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
        entry += `<div class="node-time">  Time: <span class="node-start-time">${element.node.startTime}</span> - <span class="node-end-time">${element.node.endTime}</span></div>`
        entry += `<div class="node-location"> Location: ${element.node.zone} || Position: X:${element.node.position.x} Y:${element.node.position.y}</div>`
        entry += `<div class="node-location"> Closest: ${element.node.teleport}</div>`
        entry += `<div class="node-ID">${element.node.id}</div>`
        entry += `<div class="item-ID">${element.item.id}</div>`
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
    $(e.target).closest('tr').toggleClass("highlighted")

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
            if (element.item.id == trackedItems.item.id && element.node.id == trackedItems.node.id) {
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

}


//Search Function
$(document).ready(function () {
    $("#node-search").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#node-table>tr").filter(function () {
            $(this).toggle($(this.children[1]).text().toLowerCase().indexOf(value) > -1)
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


// Setting Colour if row is saved
function tableColourSet() {
    var currentItemList = getItemIDList()
    var currentNodeList = getNodeIDList()
    $("#node-table > tr").each(function () {
        if (currentItemList.includes($(this).find(".item-ID").html())) {
            if (currentNodeList.includes($(this).find(".node-ID").html())) {
                $(this).toggleClass("highlighted")
            }
        }
    });
}

// Saved Node Highlight if time is right


function updateSavedColour() {
    var startTime
    var endTime
    var eorzeaTime = Number($('#e-time').html().replace(':', ''))
    console.log("hi");
    $(".saved-node").each(function () {
        startTime = Number($(this).find(".node-start-time").html().replace(':', ''))
        endTime = Number($(this).find(".node-end-time").html().replace(':', ''))
        if (eorzeaTime >= startTime && eorzeaTime <= endTime) {
            $(this).addClass("highlighted")
        } else {
            $(this).removeClass("highlighted")
        }

    });
}

setInterval(updateSavedColour, 2916);

// Display Item Infomation when clicking on grid

$('#saved-node-container').on('click', function (e) {
    console.log($(e.target).closest('.saved-node').find(".node-ID").html());
    console.log($(e.target).closest('.saved-node').find(".item-ID").html());

})
