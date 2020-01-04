window.onload = function () {
    chrome.tabs.query({active: true}, function (tab) {
        document.getElementById('textInput').placeholder = tab[0].url;

    })
    document.getElementById('submit').onclick = addURL;
    document.getElementById('reset').onclick = clear;
}

function addURL () {
    var vUrl = document.getElementById('textInput').value;
    if (!vUrl) vUrl = document.getElementById('textInput').placeholder;
    var vType = document.getElementById('select').value;
    chrome.storage.local.get(['info'], function (reg) {
        var index = reg.info.index ++
        reg.info.URLs[index] = {url: vUrl, type: vType};
        chrome.storage.local.set({info: reg.info}, function () {
            result(reg.info);
        });
    });
    url.value = "";
    type.checked = false;
}



function clear () {
    chrome.runtime.sendMessage('clear');
}

function result (out) {
    if (!out) out = 'successful';
    console.log(out);
}