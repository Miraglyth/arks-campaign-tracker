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
    checkLatestCampaigns();
    refreshTime();
};

function refreshTime() {
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
}

function checkLatestCampaigns() {

    // Temp to expedite checking
    localStorage.clear();

    $.getJSON("data/latest-update.json", {}, function (data) {
        if (localStorage.getItem("latestUpdate") == data.latestUpdate) {
            console.log("Local campaign data already up to date.");
            renewDisplay();
        }
        else {
            console.log("Local campaign data nonexistent or missing.");
            getLatestCampaigns(data.latestUpdate);
        }
    });
}

function getLatestCampaigns(latestUpdate) {
    console.log("Loading updated campaign data.");
    $.getJSON("data/campaigns.json", {}, function (data) {
        // Combine data with load of localStorage campaigns if it exists to create a single object with everything - Presumes all campaigns exist in new data!
        let savedData = JSON.parse(localStorage.getItem("campaigns"));
        if (savedData != null) {
            for (let annKey in savedData.announcements) {
                for (let camKey in savedData.announcements[annKey].campaigns) {
                    data.announcements[annKey].campaigns[camKey].done = savedData.announcements[annKey].campaigns[camKey].done;
                    // data.announcements[annKey].campaigns[camKey].name = 'LOLOL';
                    // data.announcements[annKey].campaigns[camKey].nameShort = 'LOL';
                }
            }
        }

        // Save new state of campaign data
        localStorage.setItem("campaigns", JSON.stringify(data));

        // Save last update
        localStorage.setItem("latestUpdate", latestUpdate);

        // Recalculate page
        renewDisplay();

        console.log("Loaded updated campaign data.");
    });
}

function renewDisplay() {
    console.log("Renewing display.");

    // Load localStorage
    let announcements = JSON.parse(localStorage.getItem("campaigns")).announcements;

    // Current time
    let dateNow = new Date(Date.now());

    // Sorting arrays
    let campaignsEnded = [];
    let campaignsActive = [];
    let campaignsUpcoming = [];

    // Assign campaigns to sorting arrays
    for (let annKey in announcements) {
        for (let camKey in announcements[annKey].campaigns) {
            if (new Date(announcements[annKey].campaigns[camKey].ends) < dateNow) {
                campaignsEnded.push({ "annKey": annKey, "camKey": camKey, "starts": announcements[annKey].campaigns[camKey].starts, "ends": announcements[annKey].campaigns[camKey].ends, "done": announcements[annKey].campaigns[camKey].done });
            }
            else if (new Date(announcements[annKey].campaigns[camKey].starts) < dateNow) {
                campaignsActive.push({ "annKey": annKey, "camKey": camKey, "starts": announcements[annKey].campaigns[camKey].starts, "ends": announcements[annKey].campaigns[camKey].ends, "done": announcements[annKey].campaigns[camKey].done });
            }
            else {
                campaignsUpcoming.push({ "annKey": annKey, "camKey": camKey, "starts": announcements[annKey].campaigns[camKey].starts, "ends": announcements[annKey].campaigns[camKey].ends, "done": announcements[annKey].campaigns[camKey].done });
            }
        }
    }

    // Sort the sorting arrays
    campaignsEnded.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || Date.parse(b.ends) - Date.parse(a.ends) || Date.parse(b.starts) - Date.parse(a.starts); });
    campaignsActive.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || Date.parse(a.ends) - Date.parse(b.ends) || Date.parse(a.starts) - Date.parse(b.starts); });
    campaignsUpcoming.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || Date.parse(a.starts) - Date.parse(b.starts); });

    // Convert sorted campaign arrays into table rows
    document.getElementById("tbodyEnded").innerHTML = campaignParse(announcements, campaignsEnded);
    document.getElementById("tbodyActive").innerHTML = campaignParse(announcements, campaignsActive);
    document.getElementById("tbodyUpcoming").innerHTML = campaignParse(announcements, campaignsUpcoming);

    console.log("Renewed display.");
}

function campaignParse(announcements, campaignList) {
    let detailName = Object.keys({ campaignList })[0];
    let tableText = '';
    for (var listNr = 0; listNr < campaignList.length; listNr++) {
        let annSel = announcements[campaignList[listNr].annKey];
        let camSel = announcements[campaignList[listNr].annKey].campaigns[campaignList[listNr].camKey];
        tableText += '<tr class="mg-simple-row ' + (camSel.done == true ? "text-muted" : "") + '" data-bs-toggle="collapse" data-bs-target="#' + detailName + listNr + '" aria-expanded="false" aria-controls="' + detailName + listNr + '">';
        tableText += '<td class="d-none d-lg-table-cell"><a href="' + annSel.url + '">' + annSel.name + '</a></td>';

        // Campaign - Include URL from Announcement below Large
        tableText += '<td class="d-table-cell d-lg-none"><a href="' + annSel.url + '">' + (camSel.nameShort ?? camSel.name) + '</a></td>';
        tableText += '<td class="d-none d-lg-table-cell">' + (camSel.nameShort ?? camSel.name) + '</td>';

        tableText += '<td class="text-nowrap d-none d-md-table-cell">' + dateParse(camSel.starts, true) + '</td>';
        tableText += '<td class="text-nowrap">' + dateParse(camSel.ends, true) + '</td>';
        tableText += '<td>' + camSel.activityShort + '</td>';
        tableText += '<td class="text-nowrap d-none d-sm-table-cell">' + rewardParse(camSel.rewards, 3) + '</td>';
        tableText += '<td class="text-nowrap d-none d-xl-table-cell">' + dateParse(camSel.distribution, true) + '</td>';
        tableText += '<td class="d-none d-xxl-table-cell">' + camSel.delivery + '</td>';
        tableText += '<td>' + '<input class="form-check-input" type="checkbox" onchange="clickDone(' + campaignList[listNr].annKey + ',' + campaignList[listNr].camKey + ',this.checked);" ' + (camSel.done == true ? 'checked' : '') + '></input>' + '</td>';
        tableText += '</tr>';

        // Detail view
        tableText += '<tr class="collapse" id="' + detailName + listNr + '">';
        tableText += '<td colspan="9">';
        tableText += '<div class="collapse" id="' + detailName + listNr + '">';
        tableText += '<div class="p-1"><u>' + camSel.name + '</u></div>';
        tableText += '<div class="p-1 d-inline d-md-none"><b>Starts:</b> ' + dateParse(camSel.starts, false) + '<br><b>Ends:</b> ' + dateParse(camSel.ends, false) + '</div>';
        tableText += '<div class="p-1"><table class="table table-bordered table-hover table-sm align-middle m-auto w-auto">';
        tableText += '<thead class="bg-dark bg-gradient text-white"><tr><th>Requirement</th><th>Rewards</th></tr></thead><tbody>';
        for (activity = 0; activity < camSel.activityFull.length; activity++) {
            tableText += '<tr><td>' + camSel.activityFull[activity] + '</td><td class="text-nowrap">' + rewardParse(camSel.rewards[activity], 10) + '</td></tr>';
        }
        tableText += '</tbody></table></div>';
        tableText += '</div>';
        tableText += '</td>';
        tableText += '</tr>';
    }
    return tableText;
}

function clickDone(annKey, camKey, checked) {
    console.log("Checkbox clicked!");
    console.log("this.checked resolves to: " + checked);

    // Load localStorage
    let campaigns = JSON.parse(localStorage.getItem("campaigns"));

    // Change data
    campaigns.announcements[annKey].campaigns[camKey].done = checked;

    // Save localStorage data
    localStorage.setItem("campaigns", JSON.stringify(campaigns));

    renewDisplay();
}

function dateParse(string, lineBreak) {
    parsedDate = new Date(string);
    let conditionalLineBreak = (lineBreak == true ? '<br>' : ' ');

    if (parsedDate == "Invalid Date") {
        return string;
    }
    else {
        let localDate = parsedDate.toLocaleString({}, { year: 'numeric', month: 'short', day: '2-digit' });
        let localTime = parsedDate.toLocaleString({}, { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
        return localDate + conditionalLineBreak + localTime;
    }
}

function rewardParse(rewardArray, listMax) {
    let returnText = '';
    let flatArray = rewardArray.flat();

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
    let i, tabcontent, tablinks;

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
