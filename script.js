$(document).ready(function () {
    initialise();
});

document.getElementById("refreshbutton").addEventListener("click", function () {
    refreshTime();
});

function initialise() {
    // Force getJSON requests to application/json type
    $.ajaxSetup({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    // Refresh on page load
    refreshAll();

    // Show Active campaigns by default
    document.getElementById("defaultOpen").click();
}

function refreshAll() {
    refreshTime();
    refreshCampaigns();
};

function refreshTime() {
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
}

function refreshCampaigns() {

    // dummyCallback(data);

    $.getJSON("campaigns.json", {}, function (data) {
        // Campaign arrays
        var campaignsEnded = [];
        var campaignsActive = [];
        var campaignsUpcoming = [];

        // Place into respective campaign arrays
        $.each(data.campaigns, function ({ }, value) {
            var dateNow = new Date(Date.now());
            if (new Date(value.timeEnd) < dateNow) {
                campaignsEnded.push(value);
            }
            else if (new Date(value.timeStart) < dateNow) {
                campaignsActive.push(value);
            }
            else {
                campaignsUpcoming.push(value);
            }
        });

        // Sort campaign arrays depending on type
        campaignsEnded.sort(function (a, b) { return a.timeEnd > b.timeEnd ? -1 : 1; });
        campaignsActive.sort(function (a, b) { return a.timeEnd < b.timeEnd ? -1 : 1; });
        campaignsUpcoming.sort(function (a, b) { return a.timeStart < b.timeStart ? -1 : 1; });

        // Convert sorted campaign arrays into table rows
        document.getElementById("tbodyEnded").innerHTML = campaignParse(campaignsEnded);
        document.getElementById("tbodyActive").innerHTML = campaignParse(campaignsActive);
        document.getElementById("tbodyUpcoming").innerHTML = campaignParse(campaignsUpcoming);
    });
}

function campaignParse(array) {
    var tableText = '';
    for (i = 0; i < array.length; i++) {
        tableText += '<tr>'
        tableText += '<td><a href="' + array[i].announcementURL + '">' + array[i].announcementName + '</a></td>';
        tableText += '<td>' + array[i].campaignName + '</td>';
        tableText += '<td class="text-center">' + dateParse(array[i].timeStart) + '</td>';
        tableText += '<td class="text-center">' + dateParse(array[i].timeEnd) + '</td>';
        tableText += '<td>' + array[i].task + '</td>';
        tableText += '<td>' + array[i].reward + '</td>';
        tableText += '<td>' + array[i].distribution + '</td>';
        tableText += '<td>' + dateParse(array[i].timeReward) + '</td>';
        tableText += '</tr>';
    }
    return tableText;
}

function dateParse(string) {
    parsedDate = new Date(string);
    if (parsedDate == "Invalid Date") {
        return string;
    }
    else {
        var localDate = parsedDate.toLocaleString({}, { year: 'numeric', month: 'short', day: 'numeric' });
        var localTime = parsedDate.toLocaleString({}, { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
        return localDate + '<br>' + localTime;
    }
}

function dummyCallback(data) {
    var myData = data;
    console.log("Campaign 0 name: " + myData.campaigns[0].name);
}

function openTable(evt, tableName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tableName).style.display = "table-row-group";
    evt.currentTarget.className += " active";
}
