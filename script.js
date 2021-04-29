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
        campaignsEnded.sort(function (a, b) { return Date.parse(b.timeEnd) - Date.parse(a.timeEnd) || Date.parse(b.timeStart) - Date.parse(a.timeStart); });
        campaignsActive.sort(function (a, b) { return Date.parse(a.timeEnd) - Date.parse(b.timeEnd) || Date.parse(a.timeStart) - Date.parse(b.timeStart); });
        campaignsUpcoming.sort(function (a, b) { return Date.parse(a.timeStart) - Date.parse(b.timeStart); });

        // Convert sorted campaign arrays into table rows
        document.getElementById("tbodyEnded").innerHTML = campaignParse(campaignsEnded, "ended");
        document.getElementById("tbodyActive").innerHTML = campaignParse(campaignsActive, "active");
        document.getElementById("tbodyUpcoming").innerHTML = campaignParse(campaignsUpcoming, "upcoming");
    });
}

function campaignParse(array, type) {
    var tableText = '';
    for (i = 0; i < array.length; i++) {
        tableText += '<tr class="mg-simple-row" data-bs-toggle="collapse" data-bs-target="#' + type + 'Detail' + i + '" aria-expanded="false" aria-controls="' + type + 'Detail' + i + '">';
        tableText += '<td class="d-none d-lg-table-cell"><a href="' + array[i].announcementURL + '">' + array[i].announcementName + '</a></td>';

        // Campaign - Include URL from Announcement below Large
        tableText += '<td class="d-table-cell d-lg-none"><a href="' + array[i].announcementURL + '">' + (array[i].campaignNameShort ?? array[i].campaignName) + '</a></td>';
        tableText += '<td class="d-none d-lg-table-cell">' + (array[i].campaignNameShort ?? array[i].campaignName) + '</td>';

        tableText += '<td class="text-center text-nowrap d-none d-md-table-cell">' + dateParse(array[i].timeStart, true) + '</td>';
        tableText += '<td class="text-center text-nowrap">' + dateParse(array[i].timeEnd, true) + '</td>';
        tableText += '<td>' + array[i].activityShort + '</td>';
        tableText += '<td class="text-nowrap d-none d-sm-table-cell">' + rewardParse(array[i].rewards, 3) + '</td>';
        tableText += '<td class="text-center text-nowrap d-none d-xl-table-cell">' + dateParse(array[i].timeReward, true) + '</td>';
        tableText += '<td class="d-none d-xxl-table-cell">' + array[i].distribution + '</td>';
        tableText += '</tr>';

        // Detail view
        tableText += '<tr class="collapse" id="' + type + 'Detail' + i + '">';
        tableText += '<td class="text-center" colspan="8">';
        tableText += '<div class="collapse" id="' + type + 'Detail' + i + '">';
        tableText += '<p><u>' + array[i].campaignName + '</u></p>';
        tableText += '<div class="d-inline d-md-none"><p><b>Starts:</b> ' + dateParse(array[i].timeStart, false) + '<br><b>Ends:</b> ' + dateParse(array[i].timeEnd, false) + '</p></div>';
        tableText += '<table class="table table-bordered table-hover table-sm align-middle m-auto w-auto">';
        tableText += '<thead class="bg-dark bg-gradient text-white"><tr><th>Requirement</th><th>Rewards</th></tr></thead><tbody>';
        for (activity = 0; activity < array[i].activityFull.length; activity++) {
            tableText += '<tr><td>' + array[i].activityFull[activity] + '</td><td class="text-nowrap">' + rewardParse(array[i].rewards[activity], 10) + '</td></tr>';
        }
        tableText += '</tbody></table>';
        tableText += '</div>';
        tableText += '</td>';
        tableText += '</tr>';
    }
    return tableText;
}

function dateParse(string, lineBreak) {
    parsedDate = new Date(string);
    var conditionalLineBreak = (lineBreak == true ? '<br>' : ' ');

    if (parsedDate == "Invalid Date") {
        return string;
    }
    else {
        var localDate = parsedDate.toLocaleString({}, { year: 'numeric', month: 'short', day: 'numeric' });
        var localTime = parsedDate.toLocaleString({}, { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
        return localDate + conditionalLineBreak + localTime;
    }
}

function rewardParse(rewardArray, listMax) {
    var returnText = '';
    var flatArray = rewardArray.flat();

    if (flatArray.length == 1) {
        returnText = flatArray[0];
    }
    else {
        returnText += '<ul>';
        if (flatArray.length <= listMax) {
            flatArray.forEach(rewardItem => returnText += '<li>' + rewardItem + '</li>');
        }
        else {
            for (rewardNr = 0; rewardNr < listMax - 1; rewardNr++) {
                returnText += '<li>' + flatArray[rewardNr] + '</li>';
            }
            returnText += '<li>Other x' + (flatArray.length - listMax + 1) + '</li>';
        }
        returnText += '</ul>';
    }

    return returnText;
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
