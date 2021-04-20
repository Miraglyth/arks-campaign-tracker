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
    var jsonData = require('./campaigns.json');
    
    var tableText = "";
    tableText += '<table border="1"><tr><th>Name</th><th>Time</th></tr>';
    
    for (jsonItem = 0; jsonItem < jsonData.campaigns.length; jsonItem++)
    {
        tableText += '<tr><td>' + jsonData.campaigns[i].name + '</td><td>' + jsonData.campaigns[i].timestamp + '</td></tr>';
    }
    
    tableText += '<tr><td>Hello</td><td>World</td></tr>';
    
    tableText += '</table>';
    document.getElementById("jsonTable").innerHTML = tableText;
}
