const redScore = document.getElementsByClassName("red-total")[0];
const blueScore = document.getElementsByClassName("blue-total")[0];
const apiDomain = "https://extralife.donordrive.com";
const querystring = window.location.search;
const urlParams = new URLSearchParams(querystring);
const message = document.getElementsByClassName("message")[0];
const messageUser = document.getElementsByClassName("message-user")[0];
const messageText = document.getElementsByClassName("message-text")[0];
const messageDonation = document.getElementsByClassName("message-donation")[0];
const error = document.getElementById("error");

let redTeamId = urlParams.get('red'),
    blueTeamId = urlParams.get('blue'),
    type = urlParams.get('type'),
    screenlocation = urlParams.get('screenlocation'),
    redDonations = [],
    blueDonations = [],
    redLastDonationTimestamp = new Date().toISOString(),
    blueLastDonationTimestamp = new Date().toISOString(),
    donations = [],
    playedDonations = [],
    newDonations = false,
    redTotal = 0,
    blueTotal = 0,
    elPing = 30000
    ;

let getTeamTotal = (team) => {
    let teamId = (team == "red") ? redTeamId : blueTeamId;
    
    return fetch(apiDomain + "/api/" + type + "/" + teamId + "?version=1.3")
        .then((response) => {
            if (response.ok) {
                return response.json()
            }

            throw response.status;
        })
        .catch(function (error) {
            console.warn(error);
        });
}

let getTeamDonations = (team, timestamp) => {
    let teamId = (team == "red") ? redTeamId : blueTeamId;
    
    return fetch(apiDomain + "/api/" + type + "/" + teamId + "/donations?version=1.3&where=createdDateUTC>%3D%27" + timestamp + "%27")
        .then((response) => {
            if (response.ok) {
                return response.json()
            }

            throw response.status;
        })
        .catch(function (error) {
            console.warn(error);
        });
}

let updateRedScore = (team) => {
    redScore.innerHTML = "$" + Math.floor(team.sumDonations);
}

let updateBlueScore = (team) => {
    blueScore.innerHTML = "$" + Math.floor(team.sumDonations);
}

let updateScores = () => {
    getTeamTotal("red")
        .then((team) => {
            updateRedScore(team);
        });

    getTeamTotal("blue")
        .then((team) => {
            updateBlueScore(team);
        });
}

let getDonations = () => {
    getTeamDonations("red", redLastDonationTimestamp)
        .then((team) => {
            redDonations = team;
            if (redDonations.length > 0) {
                for (let i = 0; i <= redDonations.length; i++) {
                    dono = redDonations.pop();
                    redLastDonationTimestamp = dono.createdDateUTC;
                    donations.push({
                        "amount": dono.amount, 
                        "displayName": dono.displayName, 
                        "message": dono.message, 
                        "team": "red",
                        "donationID": dono.donationID
                    });
                }

                updateScores();
            }
        });

    getTeamDonations("blue", blueLastDonationTimestamp)
        .then((team) => {
            blueDonations = team;
            if (blueDonations.length > 0) {
                for (let i = 0; i < blueDonations.length; i++) {
                    dono = blueDonations.pop();
                    blueLastDonationTimestamp = dono.createdDateUTC;
                    donations.push({
                        "amount": dono.amount, 
                        "displayName": dono.displayName, 
                        "message": dono.message, 
                        "team": "blue",
                        "donationID": dono.donationID
                    });
                }
                
                updateScores();
            }
        });
}

let displayDonation = (donation) => {
    messageUser.innerHTML = (donation.displayName != undefined ) ? donation.displayName : "Anonymous";
    messageText.innerHTML = (donation.message != undefined ) ? donation.message : "";
    messageDonation.innerHTML = "$" + donation.amount;

    if (playedDonations.includes(donation.donationID)) {
        return true;
    }

    playedDonations.push(donation.donationID);

    message.classList.add("message-show");
    void message.offsetWidth;
    message.classList.remove("message-hide");

    if (donation.team == "red") {
        message.classList.add("message-red");
    } else {
        message.classList.add("message-blue");
    }

    setTimeout(() => {
        message.classList.add("message-hide");
        void message.offsetWidth;
        message.classList.remove("message-show");
        message.classList.remove("message-red");
        message.classList.remove("message-blue");
        messageUser.innerHTML = "";
        messageText.innerHTML = "";
        messageDonation.innerHTML = "";
    }, 10000);
}

let processDonations = () => {
    if (donations.length > 0) {
        displayDonation(donations.pop());
    }

    setTimeout(processDonations, 12000);
}

let updateWidget = () => {
    getDonations();
    setTimeout(updateWidget, elPing);
}

let loadWidget = () => {
    updateScores();
    processDonations();
    setTimeout(updateWidget, elPing);
}

document.addEventListener("DOMContentLoaded", function() {
    let load = true;
    if (redTeamId == undefined) {
        error.innerHTML += "Please include a number for the red value in the URL.<br>";
        load = false;
    }
    if (blueTeamId == undefined) {
        error.innerHTML += "Please include a number for the blue value in the URL.<br>";
        load = false;
    }
    if (type == undefined) {
        error.innerHTML += "Please include a type of \"teams\" or \"participants\" in the URL.<br>";
        load = false;
    }
    if (screenlocation == undefined) {
        error.innerHTML += "Please include a screenlocation of \"top\" or \"bottom\" in the URL.<br>";
        load = false;
    }

    if (load) {
        if (screenlocation == "top") {
            message.classList.add("screen-top");
        } else {
            message.classList.add("screen-bottom");
        }

        loadWidget();
    }
});