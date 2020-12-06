//Add Listener every time popup.html pops up

window.onload = function () {
    placeUrl ();
    initialize ();
    this.document.getElementById('gear').onclick = goOptions;
    this.document.getElementById('submit').onclick = addUrl;
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

function addUrl () {
//Get URL information from Form
    chrome.storage.local.get(['config', 'urlInfo', 'bbInfo'], function (reg) {
        var txt = document.getElementById('textInput').value;
        try {
            var urlEval = new URL(txt);
        }
        catch {
            alert('Invalid URL')
            placeUrl()
            return
        }
        for (let url of reg.urlInfo.urls) {
            if (url.url[0] == urlEval[0]) {
                alert('URL already exist');
                document.getElementById('textInput').value = "";
                return;
            }
        }
        for (let url of reg.bbInfo.urls) {
            if (url.url[0] == urlEval[0]) {
                alert('URL already exist');
                document.getElementById('textInput').value = "";
                return;
            }
        }
        var vOpen = document.getElementById('select').value;

//Append new URL object to Array
        reg.urlInfo.urls[reg.urlInfo.urls.length] = {url: urlEval, open: vOpen, openIn: reg.config.openUrlIn, open: reg.config.openUrl, key: reg.urlInfo.urls.length};
        chrome.storage.local.set({urlInfo: reg.urlInfo}, function () {
            chrome.runtime.sendMessage('urlAdded');
            alert('Saved')
        });
    });
}

//Set Placeholder

function placeUrl () {
    chrome.storage.local.get(['config'], function (reg) {
        chrome.tabs.query(reg.config.urlAttr, function (tabs) {
            var urlEval = new URL(tabs[0].url)
            document.getElementById('textInput').value = urlEval.href;
        });
    });
}