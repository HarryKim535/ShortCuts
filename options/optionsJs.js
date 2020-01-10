window.onload = function () {
    initialize ();
    this.document.title = 'Settings - ShortCuts';
    this.document.getElementById('bbInfo').onclick = expand;
    this.document.getElementById('urlInfo').onclick = expand;
}

function initialize () {
    chrome.storage.local.get(['config'], function (reg) {
        var optStr = getCurrent(reg);
        var options_openBBIn = makeOptions(optStr.openIn, reg.config.openBBIn);
        for (let i of options_openBBIn) {
            document.getElementById('openBBIn').append(i);
        }
        var options_openBB = makeOptions(optStr.open, reg.config.openBB);
        for (let i of options_openBB) {
            document.getElementById('openBB').append(i);
        }
        var options_openUrlIn = makeOptions(optStr.openIn, reg.config.openUrlIn);
        for (let i of options_openUrlIn) {
            document.getElementById('openUrlIn').append(i);
        }
        var options_openUrl = makeOptions(optStr.open, reg.config.openUrl);
        for (let i of options_openUrl) {
            document.getElementById('openUrl').append(i);
        }
    });
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
    //for direct insert to initialize function

    /*for (let i of tempOpenInValues) {
        tempOpenIn.push({name: 'class', value: i});
    }
    for (let i of tempOpenValues) {
        tempOpen.push({name: 'class', value: i});
    }*/
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

function expand (input) {
    if (input.target.checked) {
        update(input);
    }
    else {
        var elements = input.path[3].querySelectorAll('div[class="url"]');
        elements.forEach(element => element.remove());;
        elements = input.path[3].querySelectorAll('div[class="indvSettings"]');
        elements.forEach(i => i.remove());
    }
}

function update (input) {
    chrome.storage.local.get(['config', input.target.id], reg => {
        var optStr = getCurrent(reg);
        if (input.target.id == 'bbInfo') {
            var info = reg.bbInfo;
        }
        else if (input.target.id == 'urlInfo') {
            var info = reg.urlInfo;
        }
        for (let i of info.urls) {
            let url = makeElement('div', [{name: 'class', value: 'url'}], [ makeElement('span', [{name: 'class', value: 'selecHeader'}], [ i.url[0]] )[0] ])[0];
            input.path[3].querySelector('div[class="objHeader"]').append(url);
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
            input.path[3].querySelector('div[class="innerObj"]').append(indvSettings);
            console.log(indvSettings);
        }
    });
}