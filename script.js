function Init()
{
    document.getElementById("timeDisplay").innerHTML = "The time in UTC is: " + new Date(Date.now()).toUTCString();
}
