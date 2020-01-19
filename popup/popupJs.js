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

function addUrl (_, urlInput) {
//Get URL information from Form
    chrome.storage.local.get(['config', 'urlInfo', 'bbInfo'], function (reg) {
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
            alert('Invalid URL')
            document.getElementById('textInput').value = "";
            placeUrl ();
            return;
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
        console.log(urlEval);
        var vOpen = document.getElementById('select').value;
//reserved for new version
        /* 
        if (urlEval[1]) {
            urlEval[0] = urlEval[4] + urlEval[5];
            if (urlEval[3]) urlEval[0] = urlEval[3] + urlEval[0];
            if (vOpen == 'every') urlEval[0] += '/';
        }
        else if (urlEval[10]) {
            if (!urlEval[14]) urlEval[0] = urlEval[11] + urlEval[13];
            else if (urlEval[14]&&!urlEval[15]) urlEval[0] = urlEval[11] + urlEval[13];
            else if (urlEval[15]) urlEval[0] = urlEval[11] + urlEval[13] + urlEval[14] + urlEval[15];
        }
        */
//Append new URL object to Array
        reg.urlInfo.urls[reg.urlInfo.urls.length] = {url: urlEval, open: vOpen, openIn: reg.config.openUrlIn, open: reg.config.openUrl, key: reg.urlInfo.urls.length};
        chrome.storage.local.set({urlInfo: reg.urlInfo}, function () {
            chrome.runtime.sendMessage('urlAdded');
            alert('Saved')
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