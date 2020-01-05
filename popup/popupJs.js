//Add Listener every time popup.html pops up

window.onload = function () {
    placeURL ();
    document.getElementById('submit').onclick = addURL;
    document.getElementById('reset').onclick = clear;
}

//Store URL object when Save botton got pressed

function addURL () {
//Get URL information from Form
    var re = /chrome:\/\/\S*|\S*[.]\S*/;
    var vUrl = document.getElementById('textInput').value;
    if (vUrl === "" ) {
        vUrl = document.getElementById('textInput').placeholder;
        if (vUrl ==="") return;
    }
    else if (vUrl.match(re) === null) {
        alert('Invalid URL');
        document.getElementById('textInput').value = "";
        placeURL ();
        return;
    }
    var vType = document.getElementById('select').value;
//Append new URL object to Array
    chrome.storage.local.get(['info'], function (reg) {
        reg.info.URLs[reg.info.URLs.length] = {url: vUrl, type: vType, method: 'newTab'};
        chrome.storage.local.set({info: reg.info}, function () {
            chrome.runtime.sendMessage('urlAdded');
        });
    });
    document.getElementById('textInput').placeholder = ""
}

//Set Placeholder

function placeURL () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        console.log(tabs);
        var re = /chrome:\/\/\S*|(?<=\/\/)\S*/;
        document.getElementById('textInput').placeholder =  tabs[0].url.match(re)[0];
    });
}

//Send Clear message to background.js

function clear () {
    chrome.runtime.sendMessage('clear');
}