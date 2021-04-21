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
        tableText = '<table border="1"><tr>'
        tableText += '<th>Group Name</th>'
        tableText += '<th>Link</th>'
        tableText += '<th>Task Name</th>'
        tableText += '<th>Start Time</th>'
        tableText += '<th>End Time</th>'
        tableText += '<th>Reward Time</th>'
        tableText += '<th>Distribution</th>'
        tableText += '</tr>';

        // Table contents
        $.each(data.campaigns, function (key, value) {
            tableText += '<tr>'
            tableText += '<td>' + value.name_group + '</td>';
            tableText += '<td><a href="' + value.url + '">Link</a></td>';
            tableText += '<td>' + value.name_task + '</td>';
            tableText += '<td>' + value.time_start + '</td>';
            tableText += '<td>' + value.time_end + '</td>';
            tableText += '<td>' + value.time_reward + '</td>';
            tableText += '<td>' + value.distribution + '</td>';
            tableText += '</tr>';
        });

        // Table end
        tableText += '</table>';

        // Update span
        document.getElementById("jsonTable").innerHTML = tableText;
    });
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
