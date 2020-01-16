window.onload = function () {
    initialize ();
    this.document.getElementById('domainBB').addEventListener('click', togChecked);
    this.document.getElementById('domainUrl').addEventListener('click', togChecked);
    this.document.getElementById('openShortcuts').addEventListener('click', openShortcuts);
    this.document.getElementById('activeTab').addEventListener('change', saveChange);
    chrome.runtime.onMessage.addListener(makeChange);
}

function initialize () {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], function (reg) {
        var optStr = getCurrent(reg);
        if (reg.config.focusNewTab) document.getElementById('activeTab').setAttribute('checked', true);
        appendOptions(optStr.openIn, reg.config.openBBIn, 'openBBIn')
        appendOptions(optStr.open, reg.config.openBB, 'openBB');
        appendOptions(optStr.openIn, reg.config.openUrlIn, 'openUrlIn');
        appendOptions(optStr.open, reg.config.openUrl, 'openUrl');
        appendUrls(reg.bbInfo, optStr, 'bookmarks');
        appendUrls(reg.urlInfo, optStr, 'urls');
        for (let element of this.document.getElementsByClassName('selec')) {
            element.addEventListener('change', saveChange);
        }
    });
}

function appendOptions (optStr, values, id) {
    var options = makeOptions(optStr, values);
    for (let i of options) {
        document.getElementById(id).append(i);
    }
}

function togChecked (input) {
    var element = input.currentTarget;
    if (element.getAttribute('checked') == 'true') {
        element.removeAttribute('checked');
        element.querySelector('.expand').removeAttribute('checked');
        document.getElementById(element.id + 'Info').removeAttribute('checked');
    }
    else {
        element.setAttribute('checked', true);
        element.querySelector('.expand').setAttribute('checked', true);
        document.getElementById(element.id + 'Info').setAttribute('checked', true);
    }

}

function openShortcuts () {
    chrome.windows.create({url: 'chrome://extensions/shortcuts', type: 'popup', setSelfAsOpener: true})
}

function saveChange (input) {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
        var optStr = getCurrent(reg);
        if (input.target.type == 'checkbox') {
            reg.config.focusNewTab = input.target.checked;
        }
        else if (input.target.id == 'openBBIn') {
            reg.config.openBBIn = input.target.value;
            for (let url of reg.bbInfo.urls) {
                url.openIn = input.target.value;
            }
            update (reg.bbInfo, optStr, 'bookmarks');
        }
        else if (input.target.id == 'openBB') {
            reg.config.openBB = input.target.value;
            for (let url of reg.bbInfo.urls) {
                url.open = input.target.value;
            }
            update (reg.bbInfo, optStr, 'bookmarks');
        }
        else if (input.target.id == 'openUrlIn') {
            reg.config.openUrlIn = input.target.value;
            for (let url of reg.urlInfo.urls) {
                url.openIn = input.target.value;
            }
            update (reg.urlInfo, optStr, 'urls');
        }
        else if (input.target.id == 'openUrl') {
            reg.config.openUrl = input.target.value;
            for (let url of reg.urlInfo.urls) {
                url.open = input.target.value;
            }
            update (reg.urlInfo, optStr, 'urls');
        }
        else {
            let re = /open(In)?[(](\S+)[)]/
            var url = input.target.id.match(re);
            for (let index in reg.bbInfo.urls) {
                if (url[2] == reg.bbInfo.urls[index].url[0]) {
                    if (url[1]) reg.bbInfo.urls[index].openIn = input.target.value;
                    else reg.bbInfo.urls[index].open = input.target.value
                    console.log(reg.bbInfo.urls[index].open)
                }
            }
            for (let index in reg.urlInfo.urls) {
                if (url[2] == reg.urlInfo.urls[index].url[0]) {
                    if (url[1]) reg.urlInfo.urls[index].openIn = input.target.value;
                    else reg.urlInfo.urls[index].open = input.target.value
                }
            }
        }
        chrome.storage.local.set({config: reg.config, bbInfo: reg.bbInfo, urlInfo: reg.urlInfo}, function () {
            console.log('saved');
        });
    });
}

function makeChange (msg) {
    chrome.storage.local.get(['config', 'bbInfo', 'urlInfo'], reg => {
        var optStr = getCurrent(reg)
        if (msg == 'urlAdded') {
            update(reg.urlInfo, optStr, 'urls');
        }
        else if (msg == 'edited') {
            update(reg.bbInfo, optStr, 'bookmarks');
            console.log('passing')
        }
        console.log(msg);
    });
}

function update (Info, optStr, domain) {
    deleteUrls(domain);
    appendUrls(Info, optStr, domain);
}

function getCurrent (reg) {
    var tempOpenIn = {value: [], str: []};
    var tempOpen= {value: [], str: []};
    tempOpenIn.value = tempOpenIn.value.concat(reg.config.openIn.value);
    tempOpenIn.str = tempOpenIn.str.concat(reg.config.openIn.str);
    tempOpen.value = tempOpen.value.concat(reg.config.open.value);
    tempOpen.str = tempOpen.str.concat(reg.config.open.str);
    if (reg.config.optDetails) {
        tempOpenIn.value = tempOpenIn.value.concat(reg.config.openIn.detail);
        tempOpenIn.str = tempOpenIn.str.concat(reg.config.openIn.str_detail);
        tempOpen.value = tempOpen.value.concat(reg.config.open.detail);
        tempOpen.str = tempOpen.str.concat(reg.config.open.str_detail);
    }
    return {openIn: tempOpenIn, open: tempOpen};
}

function makeElement(tag, attrs, childs, aTag, eAttr, eChild) {
    var elements = [];
    var i = 0;
    do {
        let element = document.createElement(tag);
        if (eAttr) {
            for (let j of attrs) {
                element.setAttribute(j.name, j.value);
            }
        }
        else if (attrs) element.setAttribute(attrs[i].name, attrs[i].value);
        if (eChild) {
            for (let j of childs) {
                element.append(j);
            }
        }
        else if (childs) element.append(childs[i]);
        elements.push(element);
        i++;
    } while (i < aTag)
    return elements;
}

function makeOptions (optStr, isValue) {
    var elements = [];
    optStr.value.forEach(function (item, index) {
        let attrs = [];
        attrs.push({name: 'value', value: item});
        if (item == isValue) attrs.push({name: 'selected', value: true});
        elements.push(makeElement('option', attrs, [optStr.str[index]], 1, true)[0]);
    });
    return elements;
}

function appendUrls (info, optStr, domain) {
    for (let i of info.urls) {
        let url = makeElement('div', [{name: 'class', value: 'url'}], 
            [makeElement('div', [{name: 'class', value: 'more'}], [ makeElement('div', [{name: 'class', value: 'dots'}])[0] ])[0],
            makeElement('span', [{name: 'class', value: 'selecHeader'}], [ i.url[0] ])[0] ], 1, false, true)[0];
        document.querySelector('#' + domain + ' .objHeader').append(url);
        let indvSettings = makeElement('div', [{name: 'class', value: 'indvSettings'}],
            [makeElement('div', [{name: 'class', value: 'sepLine'}])[0],
            makeElement('div', [{name: 'class', value: 'setting'}],
                [makeElement('span', [{name: 'class', value: 'selecHeader'}], ['Open in a'])[0],
                makeElement('select', [{name: 'id', value: 'openIn('+i.url[0]+')'}, {name: 'class', value: 'selec'}], 
                    makeOptions(optStr.openIn, i.openIn),
                1, true, true)[0]
            ], 1, true, true)[0],
            makeElement('div', [{name: 'class', value: 'setting'}],
                [makeElement('span', [{name: 'class', value: 'selecHeader'}], ['Open'])[0],
                makeElement('select', [{name: 'id', value: 'open('+i.url[0]+')'}, {name: 'class', value: 'selec'}], 
                    makeOptions(optStr.open, i.open),
                1, true, true)[0]
            ], 1,true, true)[0]
        ], 1, true, true)[0];
        document.querySelector('#' + domain + ' .innerObj').append(indvSettings);
    }
}

function deleteUrls (domain) {
    var elements = document.querySelectorAll('#' + domain + ' .objHeader .url');
    for (let element of elements)
        element.remove();
    elements = document.querySelectorAll('#' + domain + ' .innerObj .indvSettings');
    for (let element of elements)
        element.remove();
}