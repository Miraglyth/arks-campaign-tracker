document.addEventListener("DOMContentLoaded", function() {
    Init();
});

document.getElementById("refreshbutton").addEventListener("click", function() {
    Init();
});

function Init()
{
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
    TableRefresh();
};

function TableRefresh()
{
    var tableText = "";
    tableText += '<table border="1"><tr><th>Name</th><th>Time</th></tr>';
    tableText += '<tr><td>Hello</td><td>World</td></tr>';
    tableText += '</table>';
    document.getElementById("jsonTable").innerHTML = tableText;
}
