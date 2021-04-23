$(document).ready(function () {
    Initialise();
});

document.getElementById("refreshbutton").addEventListener("click", function () {
    RefreshAll();
});

function Initialise() {
    // Force getJSON requests to application/json type
    $.ajaxSetup({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    // Refresh on page load
    RefreshAll();

    // Show Active campaigns by default
    document.getElementById("defaultOpen").click();
}

function RefreshAll() {
    RefreshTime();
    RefreshTables();
};

function RefreshTime() {
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
}

function RefreshTables() {
    $.getJSON("campaigns.json", {}, function (data) {
        // DummyCallback(data);

        // Variables
        var tableStartText = '';
        var tableEndedText = '';
        var tableActiveText = '';
        var tableUpcomingText = '';
        var tableEndText = '';

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

        $.each(data.campaigns, function (key, value) {
            // Determine table row content
            var tableText = '';
            tableText += '<tr>'
            tableText += '<td><a href="' + value.announcementURL + '">' + value.announcementName + '</a></td>';
            tableText += '<td>' + value.campaignName + '</td>';
            tableText += '<td>' + DateParse(value.timeStart) + '</td>';
            tableText += '<td>' + DateParse(value.timeEnd) + '</td>';
            tableText += '<td>' + value.task + '</td>';
            tableText += '<td>' + value.reward + '</td>';
            tableText += '<td>' + value.distribution + '</td>';
            tableText += '<td>' + DateParse(value.timeReward) + '</td>';
            tableText += '</tr>';

            // Determine table to place row into
            var dateNow = new Date(Date.now());
            if (new Date(value.timeEnd) < dateNow) {
                tableEndedText += tableText;
            }
            else if (new Date(value.timeStart) < dateNow) {
                tableActiveText += tableText;
            }
            else {
                tableUpcomingText += tableText;
            }
        });

        // Consistent table end
        tableEndText += '</table>';

        // Apply to all tables
        document.getElementById("tableEnded").innerHTML = tableStartText + tableEndedText + tableEndText;
        document.getElementById("tableActive").innerHTML = tableStartText + tableActiveText + tableEndText;
        document.getElementById("tableUpcoming").innerHTML = tableStartText + tableUpcomingText + tableEndText;
    });
}

function DateParse(string) {
    parsedDate = new Date(string);
    if (parsedDate == "Invalid Date") {
        return string;
    }
    else {
        return parsedDate.toLocaleString();
    }
}

function DummyCallback(data) {
    var myData = data;
    console.log("Campaign 0 name: " + myData.campaigns[0].name);
}

function OpenTable(evt, tableName) {
    RefreshTables();

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
