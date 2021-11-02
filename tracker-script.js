$(document).ready(function () {
    initialise();
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
}

function refreshAll() {
    checkSettings();
    checkLatestCampaigns();
};

function checkSettings() {
    // Load saved settings
    let settings = JSON.parse(localStorage.getItem("settings"));

    // Initialise settings if they don't exist
    if (settings == null) {
        console.log("No settings so initialising.");

        settings = {};

        settings.instantUpdate = true;
        settings.showDone = true;

        localStorage.setItem("settings", JSON.stringify(settings));

        console.log("Settings initialised.");
    }

    // Apply settings to menu
    document.getElementById("switchInstantUpdate").checked = settings.instantUpdate;
    document.getElementById("switchShowDone").checked = settings.showDone;
}

function checkLatestCampaigns() {

    // Temp to expedite checking
    // localStorage.clear();

    $.getJSON("data/latest-update.json", {}, function (data) {
        if (localStorage.getItem("latestUpdate") == data.latestUpdate) {
            console.log("Local campaign data already up to date.");
            renewDisplay();
        }
        else {
            console.log("Local campaign data nonexistent or outdated.");
            getLatestCampaigns(data.latestUpdate);
        }
    });
}

function getLatestCampaigns(latestUpdate) {
    console.log("Loading updated campaign data.");
    $.getJSON("data/campaigns.json", {}, function (newData) {
        // Load saved data
        let savedData = JSON.parse(localStorage.getItem("campaigns"));

        // Update new data with done flags of saved data
        if (savedData != null) {
            for (let annKeyN in newData.announcements) {
                let annKeyS = savedData.announcements.findIndex(x =>
                    x.date === newData.announcements[annKeyN].date && x.name === newData.announcements[annKeyN].name
                );
                if (annKeyS != -1) {
                    for (let camKeyN in newData.announcements[annKeyN].campaigns) {
                        let camKeyS = savedData.announcements[annKeyS].campaigns.findIndex(x =>
                            x.name === newData.announcements[annKeyN].campaigns[camKeyN].name &&
                            x.starts === newData.announcements[annKeyN].campaigns[camKeyN].starts &&
                            x.ends === newData.announcements[annKeyN].campaigns[camKeyN].ends
                        );
                        if (camKeyS != -1) {
                            newData.announcements[annKeyN].campaigns[camKeyN].done = savedData.announcements[annKeyS].campaigns[camKeyS].done;
                        }
                    }
                }
            }
        }

        // Save new state of campaign data
        localStorage.setItem("campaigns", JSON.stringify(newData));

        // Save last update
        localStorage.setItem("latestUpdate", latestUpdate);

        // Recalculate page
        renewDisplay();

        console.log("Loaded updated campaign data.");
    });
}

function renewDisplay() {
    console.log("Renewing display.");

    // Load saved campaigns and settings
    let announcements = JSON.parse(localStorage.getItem("campaigns")).announcements;
    let settings = JSON.parse(localStorage.getItem("settings"));

    // Current time
    let dateNow = new Date(Date.now());

    // Sorting arrays
    let campaignsEnded = [];
    let campaignsActive = [];
    let campaignsUpcoming = [];

    // Assign campaigns to sorting arrays
    for (let annKey in announcements) {
        for (let camKey in announcements[annKey].campaigns) {
            if (settings.showDone == false && announcements[annKey].campaigns[camKey].done == true) {
                // Do nothing! This hides campaigns if the setting to show them is disabled
            }
            else if (new Date(announcements[annKey].campaigns[camKey].ends) < dateNow) {
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
    campaignsEnded.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || sortParse(b.ends) - sortParse(a.ends) || sortParse(b.starts) - sortParse(a.starts); });
    campaignsActive.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || sortParse(a.ends) - sortParse(b.ends) || sortParse(a.starts) - sortParse(b.starts); });
    campaignsUpcoming.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || sortParse(a.starts) - sortParse(b.starts); });

    // Convert sorted campaign arrays into table rows
    document.getElementById("tbodyEnded").innerHTML = campaignParse(announcements, campaignsEnded, 'campaignsEnded', 100);
    document.getElementById("tbodyActive").innerHTML = campaignParse(announcements, campaignsActive, 'campaignsActive', 100);
    document.getElementById("tbodyUpcoming").innerHTML = campaignParse(announcements, campaignsUpcoming, 'campaignsUpcoming', 100);

    // Enable tooltips
    enableTooltips();

    console.log("Renewed display.");
}

function campaignParse(announcements, campaignList, campaignListName, listSize) {
    let detailName = campaignListName;
    let tableText = '';

    let rowCount = Math.min(campaignList.length, listSize);

    for (var listNr = 0; listNr < rowCount; listNr++) {
        let annSel = announcements[campaignList[listNr].annKey];
        let camSel = announcements[campaignList[listNr].annKey].campaigns[campaignList[listNr].camKey];

        let toggleText = ' data-bs-toggle="collapse" data-bs-target="#' + detailName + listNr + 'tr, #' + detailName + listNr + 'div" aria-expanded="false" aria-controls="' + detailName + listNr + 'tr, ' + detailName + listNr + 'div"';
        let linkStart = (annSel.url ? '<a href="' + annSel.url + '" target="_blank">' : '<span class="mg-tooltip" data-bs-toggle="tooltip" data-bs-placement="top" title="No announcement">');
        let linkEnd = (annSel.url ? '</a>' : '</span>');

        tableText += '<tr class="mg-simple-tr ' + (camSel.done == true ? "text-muted" : "") + '">';
        tableText += '<td class="d-none d-lg-table-cell">' + linkStart + (annSel.nameShort ?? annSel.name) + linkEnd + '</td>';

        // Campaign - Include URL from Announcement below Large
        tableText += '<td class="d-table-cell d-lg-none">' + linkStart + (camSel.nameShort ?? camSel.name) + linkEnd + '</td>';
        tableText += '<td class="d-none d-lg-table-cell"' + toggleText + '>' + (camSel.nameShort ?? camSel.name) + '</td>';

        tableText += '<td class="text-nowrap d-none d-md-table-cell"' + toggleText + '>' + dateParse(camSel.starts, camSel.startsNote, true) + '</td>';
        tableText += '<td class="text-nowrap"' + toggleText + '>' + dateParse(camSel.ends, camSel.endsNote, true) + '</td>';
        tableText += '<td' + toggleText + '>' + camSel.activityShort + '</td>';
        tableText += '<td class="text-nowrap d-none d-sm-table-cell"' + toggleText + '>' + rewardParse(camSel.rewards, true, 3) + '</td>';
        tableText += '<td class="text-nowrap d-none d-xl-table-cell"' + toggleText + '>' + dateParse(camSel.distribution, camSel.distributionNote, true) + '</td>';
        tableText += '<td class="d-none d-xxl-table-cell"' + toggleText + '>' + camSel.delivery + '</td>';
        tableText += '<td>' + '<input class="form-check-input mg-checkbox" type="checkbox" onchange="clickDone(' + campaignList[listNr].annKey + ',' + campaignList[listNr].camKey + ',this.checked);" ' + (camSel.done == true ? 'checked' : '') + '></input>' + '</td>';
        tableText += '</tr>';

        // Detail view
        tableText += '<tr class="mg-detail-tr collapse" id="' + detailName + listNr + 'tr" data-bs-parent="#collapseParentDiv">';
        tableText += '<td class="mg-detail-td" colspan="9">';
        tableText += '<div class="collapse" id="' + detailName + listNr + 'div" data-bs-parent="#collapseParentTable">';
        tableText += '<div class="mg-detail-div">';
        tableText += '<div class="pt-1"><u>' + annSel.name + '</u></div>';
        if (annSel.name != camSel.name) {
            tableText += '<div class="pb-1">' + camSel.name + '</div>';    // When this isn't shown some padding is missing too
        }
        tableText += '<div class="py-1 d-inline d-md-none"><b>Starts:</b> ' + dateParse(camSel.starts, camSel.startsNote, false) + '<br><b>Ends:</b> ' + dateParse(camSel.ends, camSel.endsNote, false) + '</div>';
        tableText += '<div class="py-1"><table class="table table-bordered table-hover table-sm align-middle m-auto w-auto">';
        tableText += '<thead class="bg-dark bg-gradient text-white"><tr><th>Requirement</th><th>Rewards</th></tr></thead><tbody>';
        for (activity = 0; activity < camSel.activityFull.length; activity++) {
            tableText += '<tr><td>' + camSel.activityFull[activity] + '</td><td class="text-nowrap">' + rewardParse(camSel.rewards[activity], false, 10) + '</td></tr>';
        }
        tableText += '</tbody></table></div>';
        tableText += '</div>';
        tableText += '</div>';
        tableText += '</td>';
        tableText += '</tr>';
    }
    return tableText;
}

function dateParse(dateTime, tooltipNote, lineBreak) {
    parsedDate = new Date(dateTime);
    let conditionalLineBreak = (lineBreak == true ? '<br>' : ' ');

    let returnText = '';

    if (parsedDate == "Invalid Date") {
        returnText = dateTime;
    }
    else {
        let localDate = parsedDate.toLocaleString({}, { year: 'numeric', month: 'short', day: '2-digit' });
        let localTime = parsedDate.toLocaleString({}, { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
        returnText = localDate + conditionalLineBreak + localTime;
    }

    if (tooltipNote != undefined) {
        returnText = '<span class="mg-tooltip" data-bs-toggle="tooltip" data-bs-placement="top" title="' + tooltipNote + '">' + returnText + '</span>';
    }

    return returnText;
}

function rewardParse(rewardArray, isSummary, listMax) {
    // Flatten for summary to combine all activities
    let unifiedArray = [];
    if (isSummary == true) {
        unifiedArray = rewardArray.flat(1);
    }
    else {
        unifiedArray = rewardArray;
    }

    // Get distinct first-appearance-order of reward names
    let distinctArray = [];
    for (unifiedNr = 0; unifiedNr < unifiedArray.length; unifiedNr++) {
        distinctArray.push(unifiedArray[unifiedNr][0]);
    }
    distinctArray = [...new Set(distinctArray)];

    // Sum of reward quantities
    let parsedArray = [];
    for (distinctNr = 0; distinctNr < distinctArray.length; distinctNr++) {
        let qtySum = 0;
        for (unifiedNr = 0; unifiedNr < unifiedArray.length; unifiedNr++) {
            if (distinctArray[distinctNr] == unifiedArray[unifiedNr][0]) {
                qtySum += unifiedArray[unifiedNr][1];
            }
        }
        parsedArray.push([distinctArray[distinctNr], (isNaN(qtySum) ? '?' : qtySum)]);
    }

    // Determine number of unified rewards to return directly
    let returnSize = 0;
    let otherQty = 0;
    if (parsedArray.length <= listMax) {
        returnSize = parsedArray.length;
    }
    else {
        returnSize = listMax - 1;
        for (parsedNr = listMax - 1; parsedNr < parsedArray.length; parsedNr++) {
            otherQty += parsedArray[parsedNr][1];
        }
    }

    // Set return text
    let returnText = '';
    returnText += '<ul class="mg-reward-list">';
    for (returnNr = 0; returnNr < returnSize; returnNr++) {
        returnText += '<li>' + parsedArray[returnNr][0] + ' <span class="text-muted">x' + parsedArray[returnNr][1] + '</span></li>';
    }
    if (otherQty > 0) {
        returnText += '<li>Other <span class="text-muted">x' + (isNaN(otherQty) ? '?' : otherQty) + '</span></li>';
    }
    returnText += '</ul>';

    return returnText;
}

function sortParse(dateTime) {
    // Convert dateTime to a number
    let parsedDate = Date.parse(dateTime);

    // If dateTime is not a dateTime, use end-of-time as a number
    if (isNaN(parsedDate)) {
        parsedDate = Date.parse("9999-12-31T23:59:59Z");
    }

    return parsedDate;
}

function enableTooltips() {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

function clickDone(annKey, camKey, checked) {
    // Load campaigns and settings
    let campaigns = JSON.parse(localStorage.getItem("campaigns"));
    let settings = JSON.parse(localStorage.getItem("settings"));

    // Change data
    campaigns.announcements[annKey].campaigns[camKey].done = checked;

    // Save localStorage data
    localStorage.setItem("campaigns", JSON.stringify(campaigns));

    // Renew display if the setting to do so is enabled
    if (settings.instantUpdate == true) {
        renewDisplay();
    }
}

function openTable(tableName) {
    // Declare all variables
    let i, tabcontent;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tableName).style.display = "table-row-group";
}

function changeSetting(event) {
    let settingName = event.currentTarget.id;
    let settingState = event.currentTarget.checked;
    let callUpdate = false;
    console.log("I clicked the change setting button! " + settingName + ' ' + settingState);

    // Load saved settings
    let settings = JSON.parse(localStorage.getItem("settings"));

    // Update settings and initiate an update if appropriate
    if (settingName == "switchInstantUpdate") {
        settings.instantUpdate = settingState;
        if (settingState == true) {
            callUpdate = true;
        }
    }
    else if (settingName == "switchShowDone") {
        settings.showDone = settingState;
        callUpdate = true;
    }

    // Save new state of settings
    localStorage.setItem("settings", JSON.stringify(settings));

    // Call update if triggered
    if (callUpdate == true) {
        renewDisplay();
    }
}
