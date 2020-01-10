//Ge bookmarkbar information

function getBBInfo () {
    chrome.bookmarks.getChildren('1', bookmarks => {
        chrome.storage.local.get(['bbInfo', 'config'], reg => {
            var re = RegExp(reg.config.urlForm)
            for (i in bookmarks) {
                reg.bbInfo.urls[i] = {url: bookmarks[i].url.match(re), openIn: reg.config.openBBIn, open: reg.config.openBB, isActive: reg.config.tabAttr.active, key: i};
            }
            chrome.storage.local.set({bbInfo: reg.bbInfo}, function () {
                console.log(reg.bbInfo);
            });
        });
    });
}

//Open websites with keyboard shortcut

function setShortcuts (command) {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
        var re = /(BM|URL)_(\d)/;
        var input = command.match(re);
        var g = input[1];
        var i = input[2];
        if (g =='BM') {
            reg.config.tabAttr.url = reg.bbInfo.urls[i].url[0];
            reg.config.tabAttr.active = reg.bbInfo.urls[i].isActive;
            console.log(reg.config.tabAttr.url);
            chrome.tabs.create(reg.config.tabAttr);
        }
        else if (g == 'URL') {
            for (item in reg.urlInfo.urls) {
                if (item.key == i) {
                    reg.config.tabAttr.url = item.url[0];
                    reg.config.tabAttr.active = item.active;
                    chrome.tabs.create(reg.config.tabAttr);
                }
            }
        }
    });
}

//Check message and excute proper function

function checkMsg (msg) {
    if (msg == 'urlAdded') {
        chrome.storage.local.get(['urlInfo'], reg => {
            console.log(reg.urlInfo.urls);
        });
    }
    else if (msg == 'cfClear') {
        chrome.storage.local.get(['config'], reg => {
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
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
        /*chrome.windows.getAll(function (windows) {
            if (windows.length > reg.config.maxWin) {
                alert('Generating New Window Aborted\nMaxinum Number of Windows Cannot Surpass ' + reg.config.maxWin);
                return; //Abort
            }
            console.log(windows);*/
            console.log('read');
            reg.config.winAttr.tabId = tab.id;
            var re = new RegExp(reg.config.urlForm);
            var urlEval = tab.pendingUrl.match(re);
            if (reg.bbInfo.urls) {
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
    chrome.runtime.onInstalled.addListener(initialize);
    chrome.runtime.onStartup.addListener(getBBInfo);
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

function initialize (details) {
    //for real use
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
            /*Retrun an array: [
                0: result
                1: http url
                2: 'http[s]://'
                3: 'www.'
                4: host
                5: '/'
                6: path
                7: '?'
                8: '/$'
                9: chrome url
                10: chrome scheme
                11: offline notion
                12: host
                13: '/'
                14: path
                15: '?'
                16: '/$'
                17: file url
                18: ftp url
                19: about url
            ]*/
        urlForm: '((https?://)?(www[.])?([A-Za-z0-9%\\-_]+[.][A-Za-z0-9./%\\-_]+)(/)?([A-Za-z0-9./%\\-_]*)?([?])?(/$)?)|((chrome(-[a-z]+)?://)([a-z]+)(/)?([A-Za-z]*)([?])?(/$)?)|(file:///?\\S+)|(ftp://\\S+)|(about:\\w+)',
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
            left: 593,
            top: 100,
            width: 734,
            height: 500,
            type: 'panel',
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
        openBB: 'only',
        openUrl: 'only',
        openBBIn: 'newTab',
        openUrlIn: 'newWin',
        openFileIn: 'newWin',
        urlKey: -1,
        optDetails: true,
        optAdvanced: false,
        maxWin: 5,
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
            curUrl: null
        }
    },
    function () {
        getBBInfo ();
        console.log('bookmark cleared');
    });
}

//for developing purpose only

function showStored (name) {
    chrome.storage.local.get([name], reg => {
        console.log(reg);
    });
}

//Main

initialize ();

setListeners ();



//+Simpler version of bookmarkbar shortcuts

function goDirect () {
    chrome.commands.onCommand.addListener(command => {
        var index = command[command.length-1];
        chrome.bookmarks.getChildren('1', bookmarks => {
            console.log(bookmarks);
            chrome.tabs.create({url: bookmarks[index].url});
        });
    });
}

//goDirect ();