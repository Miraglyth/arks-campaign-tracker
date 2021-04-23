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
    refreshTables();
};

function refreshTime() {
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
}

function refreshTables() {
    $.getJSON("campaigns.json", {}, function (data) {
        // dummyCallback(data);

        // Variables
        var tableStartText = '';
        var tableEndedText = '';
        var tableActiveText = '';
        var tableUpcomingText = '';
        var tableEndText = '';

        // WIP variables
        var campaignsEnded = [];
        var campaignsActive = [];
        var campaignsUpcoming = [];

        // Consistent table start
        tableStartText += '<table border="1"><tr>';
        tableStartText += '<th>Announcement</th>';
        tableStartText += '<th style="width: 300px;">Campaign Name</th>';
        tableStartText += '<th>Start Time</th>';
        tableStartText += '<th>End Time</th>';
        tableStartText += '<th>Activity</th>';
        tableStartText += '<th>Reward</th>';
        tableStartText += '<th>Distribution</th>';
        tableStartText += '<th>Reward Time</th>';
        tableStartText += '</tr>';

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
        campaignsEnded.sort((a, b) => a.timeEnd < b.timeEnd);
        campaignsActive.sort((a, b) => a.timeEnd > b.timeEnd);
        campaignsUpcoming.sort((a, b) => a.timeStart > b.timeStart);

        // Convert sorted campaign arrays into table rows
        tableEndedText = campaignParse(campaignsEnded);
        tableActiveText = campaignParse(campaignsActive);
        tableUpcomingText = campaignParse(campaignsUpcoming);

        // Debug on Chrome
        console.log(tableActiveText);

        // Consistent table end
        tableEndText += '</table>';

        // Apply to all tables
        document.getElementById("tableEnded").innerHTML = tableStartText + tableEndedText + tableEndText;
        document.getElementById("tableActive").innerHTML = tableStartText + tableActiveText + tableEndText;
        document.getElementById("tableUpcoming").innerHTML = tableStartText + tableUpcomingText + tableEndText;
    });
}

function campaignParse(array) {
    var tableText = '';
    for (i = 0; i < array.length; i++) {
        tableText += '<tr>'
        tableText += '<td><a href="' + array[i].announcementURL + '">' + array[i].announcementName + '</a></td>';
        tableText += '<td>' + array[i].campaignName + '</td>';
        tableText += '<td>' + dateParse(array[i].timeStart) + '</td>';
        tableText += '<td>' + dateParse(array[i].timeEnd) + '</td>';
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
        return parsedDate.toLocaleString();
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
    document.getElementById(tableName).style.display = "block";
    evt.currentTarget.className += " active";
}
