//Ge bookmarkbar information

function getBBInfo () {
    chrome.bookmarks.getChildren('1', function (bookmarks) {
        chrome.storage.local.get(['bbInfo', 'config'], function (reg) {
            var re = RegExp(reg.config.urlForm)
            for (i in bookmarks) {
                var urlEval = bookmarks[i].url.match(re);
                if (urlEval[2]) urlEval[0] = urlEval[3];
                if (!urlEval[4]&&!urlEval[5]&&urlEval[6]&&!urlEval[7]) urlEval[0] += '/';
                reg.bbInfo.urls[i] = {url: urlEval[0], openIn: reg.config.openBBIn, key: Number(i) + 1};
            }
            chrome.storage.local.set({bbInfo: reg.bbInfo}, function () {
                console.log(reg.bbInfo);
            });
        });
    });
}

//Open websites with keyboard shortcut

function setShortcuts (_, keyData) {
    if (keyData.type == 'keydown') {
        var re = /\d/;
        if (keyData.key.match(re) === null) return;
        chrome.storage.local.get(['config'], function (reg) {
            if (keyData.altKey&&!keyData.ctrlKey&&!keyData.shiftKey) {
                chrome.storage.local.get([reg.config.openByAlt], function (alt) {
                    info = getChildren(alt);
                    for (item in info.urls) {
                        if (item.key == keyData.key) {
                            reg.config.tabAttr.url = item.url;
                            chrome.tabs.create(reg.config.tabAttr);
                        }
                    }
                });
            }
            else if (!keyData.altKey&&keyData.ctrlKey&&keyData.shiftKey) {
                chrome.storage.local.get([reg.config.openByShCtrl], function (shCtrl) {
                    info = getChildren(shCtrl);
                    for (item in info.urls) {
                        if (item.key == keyData.key) {
                            reg.config.tabAttr.url = item.url;
                            chrome.tabs.create(reg.config.tabAttr);
                        }
                    }
                });
            }
        
        });
    }
}

function getChildren (reg) {
    if (reg.bbInfo) return reg.bbInfo;
    if (reg.urlInfo) return reg.urlInfo;
}
//Check message and excute proper function

function checkMsg (msg) {
    if (msg == 'started') {
        chrome.input.ime.activate(function () {
            console.log('activated');
        })
    }
    else if (msg == 'urlAdded') {
        chrome.storage.local.get(['urlInfo'], function (reg) {
            console.log(reg.urlInfo.urls);
        });
    }
    else if (msg == 'cfClear') {
        chrome.storage.local.get(['config'], function (reg) {
            if (reg.config.init) cfClear(true)
            else cfClear(false);
        })
    }
    else if (msg == 'bbClear') bbClear ();
    else if (msg == 'urlClear') urlClear ();
    else if (msg == 'toggle') showStored('config');
    else if (msg == 'notUrl') alert('Invalid URL');
    else console.log(msg);
}

//Open in a new window if so is it set

/*-solved-!Got a infinite Recursive problem
  Cannnot guerantee stability*/

function watchTabs (tab) {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], function (reg) {
        /*chrome.windows.getAll(function (windows) {
            if (windows.length > reg.config.maxWin) {
                alert('Generating New Window Aborted\nMaxinum Number of Windows Cannot Surpass ' + reg.config.maxWin);
                return; //Abort
            }
            console.log(windows);*/
            console.log('read');
            console.log(reg);
            reg.config.winAttr.tabId = tab.id;
            var re = new RegExp(reg.config.urlForm);
            var urlEval = tab.pendingUrl.match(re);
            if (urlEval[2]) urlEval[0] = urlEval[3];
            if (!urlEval[4]&&!urlEval[5]&&urlEval[6]&&!urlEval[7]) urlEval[0] += '/';
            if (reg.bbInfo.urls){
                for (i in reg.bbInfo.urls) {
                    newWindow(reg.bbInfo.urls[i], urlEval[0], reg.config);
                }
            }
            if (reg.urlInfo.urls) {
                for (i in reg.urlInfo.urls) {
                    newWindow(reg.urlInfo.urls[i], urlEval[0], reg.config);
                }
            }
        //});
    });
}

function newWindow(item, urlEval, config) {
    if (urlEval == item.url&&item.openIn == 'newWin') {
        if (config.winAttr.tabId) {
            chrome.windows.create(config.winAttr, function () {
                console.log('created ' + config.winAttr.tabId);
                return;
            });
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
    chrome.input.ime.onKeyEvent.addListener(setShortcuts);
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
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo', 'defInfo'], function (reg) {
        if (!reg.config) {
            cfClear (false);
            console.log('config initialized');
        }
        else if(reg.config.init) {
            cfClear (true);
            console.log('config initialized by init');
        } 
        if (!reg.urlInfo) {
            urlClear ();
            console.log('url initialized');
        }
        else if(reg.urlInfo.init) {
            urlClear ();
            console.log('url initialized');
        } 
        if (!reg.bbInfo) {
            bbClear ();
            console.log('bookmarks initialized')
        }
        else if(reg.bbInfo.init) {
            bbClear ();
            console.log('bookmarks initialized')
        }
    });
}

//Reset configurations

function cfClear (bool) {
    var def = {
            /*Retrun an array: [
                0: result
                1: url without protocol
                2: 'www.' if it exists
                3: url without protocol, 'www.' and query notation
                4: '?' if it exists
                5: '/' at the end of url, if it exists
                6: chrome url
                7: '/' in the middle of url, if it exists
                8: chrome second order section
                9: '/' at the end of chrome url, if it exists
                10: file url without protocol
                11: urls start in 'about:'
            ]*/
        urlForm: '((?<=(?:https?://)?)(www[.])?([A-Za-z0-9%\\-_]+[.][A-Za-z0-9./%\\-_]+)([?])?(/$)?)|(chrome(?:-[a-z]+)?://[a-z\\-_]+(/)?([a-z\\-_]*)(/$)?)|((?<=file:///?)\\S+)|(about:\\w+)',
        urlAttr: {
            active: true,
            currentWindow: true
        },
        winAttr: {
            tabId: 0,
            setSelfAsOpener: true
        },
        openByAlt: 'bbInfo',
        openByShCtrl: 'urlInfo',
        openBBIn: 'newTab',
        openUrlIn: 'newWin',
        openFileIn: 'newWin',
        maxWin: 5,
        repeated: false,
        init: false
    }
    if (bool) def.init = true;
    else def.init = false;
    chrome.storage.local.set({config: def},
    function () {
        console.log('config cleared');
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
        }
    },
    function () {
        console.log('bookmark cleared');
    });
}

function showStored (name) {
    chrome.storage.local.get([name], function (reg) {
        console.log(reg);
    });
}

//Main
var pTabId = 0;

initialize ();

setListeners ();



//+Simpler version of bookmarkbar shortcuts

function goDirect () {
    chrome.commands.onCommand.addListener(function (command) {
        var index = command[command.length-1];
        chrome.bookmarks.getChildren('1', function (bookmarks) {
            console.log(bookmarks);
            chrome.tabs.create({url: bookmarks[index].url});
        });
    });
}

//goDirect ();