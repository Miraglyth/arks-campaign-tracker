$(document).ready(function () {
    RefreshAll();
});

document.getElementById("refreshbutton").addEventListener("click", function () {
    RefreshAll();
    RefreshTable();
});

function RefreshAll() {
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
    RefreshTableStatic();
};

function RefreshTable() {
    $.getJSON("campaigns.json", function (data) {
        $.each(data, function (thing) {
            // tableText += thing;
            console.log(thing[0].name);
        })
    });
}

function RefreshTableStatic() {
    var tableText = "";
    tableText += '<table border="1"><tr><th>Name</th><th>Time</th></tr>';
    tableText += '<tr><td>Hello</td><td>World</td></tr>';
    tableText += '</table>';
    document.getElementById("jsonTable").innerHTML = tableText;
}
