//Ge bookmarkbar information

function getBBInfo () {
    chrome.storage.local.get(['bbInfo', 'config'], reg => {
        chrome.bookmarks.getChildren(reg.config.folderId, bookmarks => {
            for (i in bookmarks) {
                reg.bbInfo.urls[i] = {url: new URL(bookmarks[i].url).href, openIn: reg.config.openBBIn, open: reg.config.openBB, isActive: reg.config.tabAttr.active, key: i};
            }
            chrome.storage.local.set({bbInfo: reg.bbInfo}, function () {
                chrome.runtime.sendMessage('edited');
            });
        });
    });
}

//Open websites with keyboard shortcut

function setShortcuts (command) {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
        var re = /(BM|URL)_(\d)/;
        var input = command.match(re);
        var group = input[1];
        var index = input[2];
        if (group =='BM') {
            reg.config.tabAttr.url = reg.bbInfo.urls[index].url;
            reg.config.tabAttr.active = reg.bbInfo.urls[index].isActive;
            chrome.tabs.create(reg.config.tabAttr);
        }
        else if (group == 'URL') {
            for (item in reg.urlInfo.urls) {
                if (item.key == index) {
                    reg.config.tabAttr.url = item.url.href;
                    reg.config.tabAttr.active = item.active;
                    chrome.tabs.create(reg.config.tabAttr);
                }
            }
        }
    });
}

//Check message and excute proper function

function checkMsg (msg) {
    if (msg == 'cfClear') {
        chrome.storage.local.get(['config'], reg => {
            if (reg.config.init) cfClear(true)
            else cfClear(false);
        })
    }
    else if (msg == 'bbClear') bbClear ();
    else if (msg == 'urlClear') urlClear ();
    else console.log(msg);
}

//Open in a new window if so is it set

function watchTabs (tab) {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
            reg.config.winAttr.tabId = tab.id;
            if (reg.config.focusNewTab) chrome.tabs.update(tab.id, {active: true});
            var url = new URL(tab.pendingUrl);
    });
}

function newWindow(item, urlEval, config) {
    if (item.open == 'every') item.url[0] = item.url[1, 6].join('');
    if (urlEval == item.url[0]) {
        console.log('passed')
        if (item.openIn == 'newWin') {
            if (config.winAttr.tabId) {
                chrome.windows.create(config.winAttr, function () {
                    console.log('created ' + config.winAttr.tabId);
                    return;
                });
            }
        }
        else if (item.isActive) {
            chrome.tabs.update(config.winAttr.tabId, {active: true});
        }
    }
}

//Set listeners

/*!Uncaught EvalError:
   Refused to evaluate a string as JavaScript
   because 'unsafe-eval' is not an allowed source of script in the following Content
 
  Security Policy directive:
   "script-src 'self' blob: filesystem:*/

function setListeners () {
    chrome.runtime.onInstalled.addListener(getBBInfo);
    chrome.runtime.onMessage.addListener(checkMsg);
    chrome.commands.onCommand.addListener(setShortcuts);
    chrome.bookmarks.onCreated.addListener(getBBInfo);
/*!Chrome doesn't really delete URL from bookmark when users delete one
   So do not generate a Removed event*/
    chrome.bookmarks.onRemoved.addListener(getBBInfo);
    chrome.bookmarks.onMoved.addListener(getBBInfo);
    chrome.bookmarks.onChildrenReordered.addListener(getBBInfo);
    chrome.bookmarks.onImportEnded.addListener(getBBInfo);
    chrome.tabs.onCreated.addListener(watchTabs);
}

//Define storage if undefined

function initialize () {
    //not working
    //if (details.reason == 'install') {
        chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
            //for developing purpose only
            if (!reg.config) {
                cfClear (false);
                console.log('config initialized');
            }
            else if(reg.config.init) { 
                cfClear (true);
                console.log('config initialized by init');
            }
            if (!reg.bbInfo) {
                bbClear ();
                console.log('bookmarks initialized')
            }
            else if(reg.bbInfo.init) {
                bbClear ();
                console.log('bookmarks initialized')
            }
            if (!reg.urlInfo) {
                urlClear ();
                console.log('url initialized');
            }
            else if(reg.urlInfo.init) {
                urlClear ();
                console.log('url initialized');
            }
        });
    //}
}

//Reset configurations

function cfClear (bool) {
    var def = {
        urlAttr: {
            active: true,
            currentWindow: true
        },
        tabAttr: {
            url: null,
            active: true
        },
        winAttr: {
            tabId: 0,
            setSelfAsOpener: true
        },
        optAttr: {
            url: 'options/options.html',
            left: 537,
            top: 100,
            width: 845,
            height: 540,
            type: 'popup',
            setSelfAsOpener: true
        },
    //value name self equals the parent
        open: {
            value : ['only', 'every'],
            detail: ['related'],
            str: ['Only one URL', 'Every Sub URL'],
            str_detail: ['Every related URL']
        },
        openIn: {
            value: ['newTab', 'newWin'],
            detail: ['newPop', 'newFull'],
            str: ['New Tab', 'New Window'],
            str_detail: ['New Popup', 'New Full Screen']
        },
        menuList: {
            value: ['delete'],
            str: ['Delete']
        },
        openBB: 'only',
        openUrl: 'only',
        openBBIn: 'newTab',
        openUrlIn: 'newWin',
        openFileIn: 'newWin',
        focusNewTab: true,
        folderId: '1',
        urlKey: -1,
        optDetails: false,
        optAdvanced: false,
        init: false
    }
    if (bool) def.init = true;
    else def.init = false;
    chrome.storage.local.set({config: def},
    function () {
        chrome.runtime.sendMessage('defCleared')
    });
}

//Reset urls

function urlClear () {
    chrome.storage.local.set({
        urlInfo: {
            urls: [],
            curUrl: null
        }
    },
    function () {
        console.log('url cleared');
    });
}

//Reset bookmarkbar urls

function bbClear () {
    chrome.storage.local.set({
        bbInfo: {
            urls: [],
            curUrl: null
        }
    },
    function () {
        getBBInfo ();
        console.log('bookmark cleared');
    });
}

//Main

initialize ();

setListeners ();



//+Simpler version of bookmarkbar shortcuts

function goDirect () {
    chrome.commands.onCommand.addListener(command => {
        var index = command[command.length-1];
        var folderId = '1';
        chrome.bookmarks.getChildren(folderId, bookmarks => {
            chrome.tabs.create({url: bookmarks[index].url});
        });
    });
}

//goDirect ();