//Add Listener every time popup.html pops up

window.onload = function () {
    placeUrl (true);
    initialize ();
    document.getElementById('submit').onclick = addUrl;
    document.getElementById('init').onclick = togInit;
    document.getElementById('reset').onclick = clear;
}

function initialize () {
    chrome.storage.local.get(['config'], function (reg) {
        if (reg.config.init) {
            document.getElementById('init').setAttribute('checked', true);
        }
    });
}

//Store URL object when Save botton got pressed

function addUrl (_, urlInput) {
//Get URL information from Form
    chrome.storage.local.get(['config', 'urlInfo'], function (reg) {
        if (!urlInput) {
            var re = new RegExp(reg.config.urlForm);
            var url = document.getElementById('textInput').value;
            var plholder = document.getElementById('textInput').placeholder;
            var urlEval = url.match(re);
            if (url === "") {
                if (plholder === "") return;
                chrome.tabs.query(reg.config.urlAttr, function (tabs) {
                    urlEval = tabs[0].url.match(re)
                    addUrl(_, urlEval);
                    return;
                });
                return;
            }
        }
        else {
            var urlEval = urlInput;
            console.log(urlEval);
        }
        if (urlEval === null) {
            chrome.runtime.sendMessage('notUrl');
            document.getElementById('textInput').value = "";
            placeUrl ();
            return;
        }
        if (urlEval[2]) urlEval[0] = urlEval[3];
        if (!urlEval[4]&&!urlEval[5]&&urlEval[6]&&!urlEval[7]) urlEval[0] += '/';
        console.log(urlEval);

        var vOpen = document.getElementById('select').value;
//Append new URL object to Array
        reg.urlInfo.urls[reg.urlInfo.urls.length] = {url: urlEval[0], open: vOpen, openIn: reg.config.openUrlIn};
        chrome.storage.local.set({urlInfo: reg.urlInfo}, function () {
            chrome.runtime.sendMessage('urlAdded');
        });
        document.getElementById('textInput').placeholder = "";
    });
}

//Set Placeholder

function placeUrl () {
    chrome.storage.local.get(['config', 'urlInfo'], function (reg) {
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