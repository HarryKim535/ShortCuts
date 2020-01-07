//Add Listener every time popup.html pops up

window.onload = function () {
    placeUrl ();
    initialize ();
    this.document.getElementById('gear').onclick = goOptions;
    this.document.getElementById('submit').onclick = addUrl;
    this.document.getElementById('init').onclick = togInit;
    this.document.getElementById('reset').onclick = clear;
}

function initialize () {
    chrome.storage.local.get(['config'], function (reg) {
        if (reg.config.init) {
            document.getElementById('init').setAttribute('checked', true);
        }
    });
}

function goOptions () {
    chrome.storage.local.get(['config'], function (reg) {
        chrome.windows.create(reg.config.optAttr);
    })
}

//Store URL object when Save botton got pressed

function addUrl (_, urlInput) {
//Get URL information from Form
    chrome.storage.local.get(['config', 'urlInfo'], function (reg) {
        if (!urlInput) {
            var re = new RegExp(reg.config.urlForm);
            var txt = document.getElementById('textInput').value;
            var plholder = document.getElementById('textInput').placeholder;
            var urlEval = txt.match(re);
            if (txt === "") {
                if (plholder === "") return;
                chrome.tabs.query(reg.config.urlAttr, function (tabs) {
                    urlEval = tabs[0].url.match(re);
                    addUrl(_, urlEval);
                    return;
                });
                return;
            }
        }
        else {
            var urlEval = urlInput;
        }
        if (urlEval === null) {
            chrome.runtime.sendMessage('notUrl');
            document.getElementById('textInput').value = "";
            placeUrl ();
            return;
        }
        var vOpen = document.getElementById('select').value;
//Append new URL object to Array
        reg.urlInfo.urls[reg.urlInfo.urls.length] = {url: urlEval, open: vOpen, openIn: reg.config.openUrlIn, key: reg.config.urlKey};
        chrome.storage.local.set({urlInfo: reg.urlInfo}, function () {
            chrome.runtime.sendMessage('urlAdded');
        });
        document.getElementById('textInput').placeholder = "";
    });
}

//Set Placeholder

function placeUrl () {
    chrome.storage.local.get(['config'], function (reg) {
        var re = new RegExp(reg.config.urlForm)
        chrome.tabs.query(reg.config.urlAttr, function (tabs) {
            var urlEval = tabs[0].url.match(re)
            document.getElementById('textInput').placeholder = urlEval[0];
        });
    });
}

//Send Clear message to background.js

function clear () {
    msgArray = ['cfClear', 'bbClear', 'urlClear']
    for (i in msgArray) {
        chrome.runtime.sendMessage(msgArray[i]);
    }
}

function togInit () {
    var checked = document.getElementById('init').checked;
    chrome.storage.local.get(['config'], function (reg) {
        if (checked) {
            reg.config.init = true;
        }
        else if (!checked) reg.config.init = false;
        chrome.storage.local.set({config : reg.config}, function () {
            chrome.runtime.sendMessage('toggle');
        });
    });
}