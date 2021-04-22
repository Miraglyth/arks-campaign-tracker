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
        tableStartText += '<th>Campaign Group</th>';
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
            tableText += '<td><a href="' + value.url + '">' + value.name_group + '</a></td>';
            tableText += '<td>' + value.name_task + '</td>';
            tableText += '<td>' + DateParse(value.time_start) + '</td>';
            tableText += '<td>' + DateParse(value.time_end) + '</td>';
            tableText += '<td>' + value.task + '</td>';
            tableText += '<td>' + value.reward + '</td>';
            tableText += '<td>' + value.distribution + '</td>';
            tableText += '<td>' + DateParse(value.time_reward) + '</td>';
            tableText += '</tr>';

            // Determine table to place row into
            var dateNow = new Date(Date.now());
            if (new Date(value.time_end) < dateNow) {
                tableEndedText += tableText;
            }
            else if (new Date(value.time_start) < dateNow) {
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
