/*
    Author:         Quinn Helm
    Student Number: 000737479
    Date Complete:  10/11/2019 (DD/MM/YYYY)

    Statement of Authorship:
    I, Quinn Helm, student number 000737479, certify that this material is my original work.
    No other person's work has been used without due acknowledgement and I have not made my work available to anyone else.

    Details: 
*/

var commsTemplate = "<div id='{commCount}' class='commentTemplate mx-auto'>" +
    "<button id='hideCommentBtn' onclick='hideComment({commCount}, {numnum})' class='close hideComms my-0 mr-2'>&times;</button>" +
    "<blockquote class='blockquote mx-2 my-0'>" +
    "<p class='mx-2 my-0'>{uComment}</p>" +
    "<footer class='blockquote-footer'>{uName} on {uDate}</footer>" +
    "</blockquote></div>";

var totalCount = 0;
var activeCount = 0;
var commsArray = [];

var currentTargetOwner; // used for verification during deletion. .. this is the owner of the plot, not the comment(s)
var currentAddress; // used to pull comments from database, don't really have a good key otherwise... imperfect solution :(
var hideMe; // if a comment's hide button is pressed, this is the id of the button

function getComments(jObject) {
    if (jObject != null) {
        currentTargetOwner = jObject.OWNER.trim();
        currentAddress = jObject.ADDRESS.trim();
        // pull all comments from the database matching addresses
        $.post('pullcomments.php', { "address": currentAddress }, function (data) {
            if (typeof (data) != "number") {
                commsArray = JSON.parse(data);

                totalCount = commsArray.length;
                activeCount = 0;
                $(document).ready(
                    document.getElementById("#commsTarget").html("")
                );

                var tempTarget = $(document).ready($("#commsTarget"));
                if ((commsArray != null) && (totalCount > 0)) {
                    var tempTemplate;
                    for (var i = 0; i < 5; i++) {
                        if (commsArray[i] != null) {
                            tempTemplate = commsTemplate
                                .replace('{commCount}', 'commCount' + i)
                                .replace('{uName}', commsArray[i].USERNAME)
                                .replace('{uDate}', commsArray[i].DATEMADE)
                                .replace('{uComment}', commsArray[i].COMMENT)
                                .replace('{numnum}', i);
                            tempTarget.append(tempTemplate);
                            activeCount++;
                        }
                    }
                }
        }}); // store them as json in commsArray[]

    $document.ready(("#commentsBtn").css("display", "block"));
    } else {
        var tempTarget = $(document).ready($("#commsTarget"));
        tempTarget.html("<p class='error'>Comments cannot be loaded at this time...</p>");
    }
}

function saveComment() {
    // pass form elements to php remember to set db visibility field to true
    $.post('push.php', { "address": currentAddress, "name": 'userName', "comment": 'userComment' },
        function (data) {
            if (data == 0) {
                totalCount++;
                $(document).ready($("#sub").css("display", "none"));
            } else {
                if (data == 1) {
                    $('#userName').empty();
                    alert("User name invalid!");
                } else if (data == 2) {
                    $('#userComment').empty();
                    alert("Comment invalid.");
                } else {
                    alert("Comments database currently unavailable.");
                }
            }
        }
    );
    return false;
}

function hideComment(tar, arrayNum) {
    var hideMe;
    $(document).ready(hideMe = $("#"+tar));
    var attempt = prompt("Please provide ownership verification.");

    if ((attempt == null) || (attempt === "")) {
        alert("User failed to provide information.");
    } else {
        if (attempt === currentTargetOwner) {
            // update the db visibility field to false
            $.post('update.php', { "key": commsArray[arrayNum].ID }, function (data) {
                if (data == 0) {
                    hideMe.html("Comment hidden. Deletion pending further confirmation.");
                    hideMe.addClass("error");
                } else {
                    alert("Something went wrong, comment not hidden.");
                }
            });
        } else {
            alert("Incorrect claim. Please try again!");
        }
    }
}

function loadMore() {
    var temp = activeCount;
    var tempTemplate;
    if ((totalCount > 5) && (totalCount > activeCount)) {
        for (var i = temp; i < (activeCount + 5); i++) {
            if (commsArray[i] != null) {
                // do stuff 
                tempTemplate = commsTemplate
                    .replace('{commCount}', 'commCount' + i)
                    .replace('{uName}', commsArray[i].USERNAME)
                    .replace('{uDate}', commsArray[i].DATEMADE)
                    .replace('{uComment}', commsArray[i].COMMENT)
                    .replace('{numnum}', i);
                document.getElementById("#commsTarget").append(tempTemplate);
                temp++;
            }
        }
        activeCount = temp;
    } else {
        var tempTar = $(document).ready($("#commsTarget"));
        tempTar.append("<p class='error'>Could not find additional comments...</p>");
        $(document).ready($("#commentsBtn").css("display", "none"));
    }
}