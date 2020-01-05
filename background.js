//Ge bookmarkbar information

function getBBInfo () {
    chrome.bookmarks.getChildren('1', function (bml) {
        chrome.storage.local.get(['defInfo'], function (reg) {
        var temp = [];
        for (i in bml) {
            temp.URLs[i].url = bml[i].url;
            temp.URLs[i].method = reg.defInfo.DefMethOfBB;
        }
        chrome.storage.local.set({bbInfo: temp});
        });
    });
}

//Define commands and execute

function setShortcuts () {
    chrome.commands.onCommand.addListener(function (command) {
        var i = command[command.length-1];
        chrome.storage.local.get(['bbInfo'], function (add) {
            var address = add.bbInfo[i];
                chrome.tabs.create({url: address});
        });
    });
}

//Open in a new window if so is it set

//!Got a infinite Recursive problem
//!Cannnot guerantee stability

function watchTabs (tab) {
    var re = /chrome:\/\/\S*|(?<=\/\/)\S*/;
    chrome.storage.local.get(['info', 'bbInfo'], function (reg) {
        console.log('read');
        if (reg.info.repeated) return;
        reg.bbInfo.forEach(function (item, _) {
            if (tab.pendingUrl.match(re)[0] == item.url && item.method == 'newWin') {
                reg.info.repeated = true;
                chrome.storage.local.set({info: reg.info}, function () {
                    chrome.tabs.remove(tab.id);
                    chrome.windows.create({url: tab.pendingUrl}, function () {
                        console.log('created');
                        reg.info.repeated = false;
                        chrome.storage.local.set({info: reg.info},function (){
                            console.log('stored');
                            return;
                        });
                    });
                });
            }
        });
        reg.info.URLs.forEach(function (item, _) {
            if (tab.pendingUrl.match(re)[0] == item.url && item.method == 'newWin') {
                reg.info.repeated = true;
                chrome.storage.local.set({info: reg.info}, function () {
                    chrome.tabs.remove(tab.id);
                    chrome.windows.create({url: tab.pendingUrl}, function () {
                        console.log('created');
                        reg.info.repeated = false;
                        chrome.storage.local.set({info: reg.info},function (){
                            console.log('stored');
                            return;
                        });
                    });
                });
            }
        });
    });
}

//Set listeners

/*Uncaught EvalError:
 Refused to evaluate a string as JavaScript
 because 'unsafe-eval' is not an allowed source of script in the following Content
 
 Security Policy directive:
 "script-src 'self' blob: filesystem:*/

function setListeners () {
    chrome.runtime.onInstalled.addListener(getBBInfo);
    chrome.runtime.onMessage.addListener(checkMsg);
    chrome.bookmarks.onCreated.addListener(getBBInfo);
    chrome.bookmarks.onRemoved.addListener(getBBInfo);
    chrome.bookmarks.onMoved.addListener(getBBInfo);
    chrome.bookmarks.onChildrenReordered.addListener(getBBInfo);
    chrome.bookmarks.onImportEnded.addListener(getBBInfo);
    chrome.tabs.onCreated.addListener(watchTabs);
}

//Define storage if undefined

function initialize () {
    chrome.storage.local.get(['info', 'defInfo'], function (reg) {
        if (!reg.info) {
            clear ();
        }
        if (!reg.defInfo) {
            defClear ();
        }
    });
}

//Check message and excute proper function

function checkMsg (msg) {
    if (msg == 'clear') clear();
    else if (msg == 'urlAdded') {
        chrome.storage.local.get(['info'], function (reg) {
            console.log(reg.info.URLs);
        });
    }
    else if (msg == 'defClear') defClear();
}

//Reset URLs

function clear () {
    chrome.storage.local.set({info : {URLs : [], repeated: false}}, function () {
        console.log('cleared');
    });
}

//Reset defalut constant

function defClear () {
    chrome.storage.local.set({defInfo: {DefMethOfBB: 'newTab'}}, function () {
        console.log('defalut cleared');
    });
}

//Main

initialize ();

setListeners ();

setShortcuts ();










//Simpler version of bookmarkbar shortcuts

function goDirect () {
    chrome.commands.onCommand.addListener(function (command) {
        var index = command[command.length-1];
        chrome.bookmarks.getChildren('1', function (bml) {
            console.log(bml);
            chrome.tabs.create({url: bml[index].url});
        });
    });
}

//goDirect ();