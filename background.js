function getBBInfo () {
    chrome.bookmarks.getChildren('1', function (bml) {
        var temp = [];
        for (i in bml) {
            temp[i] = bml[i].url;
        }
        result(temp);
        chrome.storage.local.set({bbInfo: temp});
    });
}

function setShortcuts () {
    chrome.commands.onCommand.addListener(function (command) {
        var i = command[command.length-1];
        chrome.storage.local.get(['bbInfo'], function (add) {
            var address = add.bbInfo[i];
                chrome.tabs.create({url: address});
        });
    });
}

/*Uncaught EvalError:
 Refused to evaluate a string as JavaScript
 because 'unsafe-eval' is not an allowed source of script in the following Content
 
 Security Policy directive:
 "script-src 'self' blob: filesystem:*/

function setListeners () {
    chrome.runtime.onInstalled.addListener(getBBInfo);
    chrome.runtime.onMessage.addListener(clearIf);
    chrome.bookmarks.onCreated.addListener(getBBInfo);
    chrome.bookmarks.onRemoved.addListener(getBBInfo);
    chrome.bookmarks.onMoved.addListener(getBBInfo);
    chrome.bookmarks.onChildrenReordered.addListener(getBBInfo);
    chrome.bookmarks.onImportEnded.addListener(getBBInfo);
}


function initialize () {
    chrome.storage.local.get(['info'], function (reg) {
        if (!reg.info) {
            result(reg);
            clear ();
        }
    });
}

function clearIf (msg) {
    if (msg=='clear') {
        clear();
    }
}

function clear () {
    chrome.storage.local.set({info : {index : 0, URLs : []}}, function () {
        result('clear');
    });
}

initialize ();

setListeners ();

setShortcuts ();











function result (out) {
    if (!out) out = 'successful';
    console.log(out);
}


function goDirect () {
    chrome.commands.onCommand.addListener(function (command) {
        var index = command[command.length-1];
        chrome.bookmarks.getChildren('1', function (bml) {
            result(bml);
            chrome.tabs.create({url: bml[index].url});
        });
    });
}

//goDirect ();