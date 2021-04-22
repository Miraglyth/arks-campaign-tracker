$(document).ready(function () {
    Initialise();
});

document.getElementById("refreshbutton").addEventListener("click", function () {
    RefreshAll();
    RefreshTable();
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
    RefreshTable();
    // RefreshTableStatic();
};

function RefreshTime() {
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
}

function RefreshTable() {
    $.getJSON("campaigns.json", {}, function (data) {
        // DummyCallback(data);

        // Table header
        var tableText = '';
        tableText = '<table border="1"><tr>';
        tableText += '<th>Campaign Group</th>';
        tableText += '<th style="width: 300px;">Campaign Name</th>';
        tableText += '<th>Start Time</th>';
        tableText += '<th>End Time</th>';
        tableText += '<th>Activity</th>';
        tableText += '<th>Reward</th>';
        tableText += '<th>Distribution</th>';
        tableText += '<th>Reward Time</th>';
        tableText += '</tr>';

        // Table contents
        $.each(data.campaigns, function (key, value) {
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
        });

        // Table end
        tableText += '</table>';

        // Update span
        document.getElementById("jsonTable").innerHTML = tableText;
    });
}

function DateParse(string) {
    parsedDate = new Date(string).toLocaleString();
    if (parsedDate == "Invalid Date") {
        return string;
    }
    else {
        return parsedDate;
    }
}

function DummyCallback(data) {
    var myData = data;
    console.log("Campaign 0 name: " + myData.campaigns[0].name);
}

function RefreshTableStatic() {
    var tableText = "";
    tableText += '<table border="1"><tr><th>Name</th><th>Time</th></tr>';
    tableText += '<tr><td>Hello</td><td>World</td></tr>';
    tableText += '</table>';
    document.getElementById("jsonTable").innerHTML = tableText;
}
