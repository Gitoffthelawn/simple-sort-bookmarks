/*
Copyright 2014, Nicola Felice

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var self = require('sdk/self');
var data = self.data;

var blacklistHandler = require("./blacklistHandler");
var backup = require("./backupBookmarks");

var storageHandler;
var sorter;
//PageMod for the advanced option tab
var optionPageMod;
//Array of workers for optionPage, this is required to destroy the detached workers
var workers = [];
//Worker for talking with the about:addons tab
var aboutAddonsWorker;

function init(newSorter, newStorageHandler) {
    sorter = newSorter;
    storageHandler = newStorageHandler;
}

/*
Activate the tab if already open
The tab is identified by the url passed to the function.

return the tab if already open
return undefined if the tab must be opened
*/
function activateTabIfOpen(url) {
    for (let tab of tabs) {
        if (tab.url === url) {
            tab.activate();
            return tab;
        }
    }
    return undefined;
}

/*
return the worker used for talking with the tab
*/
function attachScriptToAboutAddonsTab(tab) {
    tab.on("close", function() {
        //Remove the reference to the old worker so the next time i know i must
        //search for another tab to attach me to.
        aboutAddonsWorker = undefined;
    });
    return tab.attach({
        contentScriptFile: data.url("aboutAddonsContentScript.js"),
        contentScriptOptions: { "addonId": self.id }
    });
}

/*
Open the about:addons tab displaying this addon page.
If an about:addons tab is already open it will be activated
Attaching a content script to the tab is needed to open the correct section of
the settings.
*/
function openBaseSettings() {
    var aboutAddonsUrl = "about:addons";
    var aboutAddonsTab = activateTabIfOpen(aboutAddonsUrl);
    if (aboutAddonsTab === undefined) {
        tabs.open({
            url: aboutAddonsUrl,
            onReady: function(tab) {
                aboutAddonsWorker = attachScriptToAboutAddonsTab(tab);
                //This callback is async so i cant move the "emit" outside
                //For example if put at the end of openBaseSettings() the emit
                //will be called before the aboutAddonsWorker can be initialized
                //when onReady event is triggered
                aboutAddonsWorker.port.emit("activateAddonsSettings");
            }
        });
    } else {
        if (aboutAddonsWorker === undefined) {
            aboutAddonsWorker = attachScriptToAboutAddonsTab(aboutAddonsTab);
            aboutAddonsWorker.port.emit("activateAddonsSettings");
        }
    }
}

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if (index !== -1) {
        workerArray.splice(index, 1);
    }
}

/*
When the page-mod's content scripts are attached to a document whose URL matches
the page-mod's include pattern.

The listener function is passed a worker object that you can use to communicate
with the content scripts your page-mod has loaded into this particular document.
*/
function attachPageModWorker(worker) {
    workers.push(worker);
    sorter.on("sortStarted", function () {
        worker.port.emit("sortStarted");
    });
    sorter.on("completed", function () {
        worker.port.emit("sortCompleted");
    });
    worker.port.on("sortAllBookmarks", sorter.sortEverything);
    worker.port.on("backup", backup.backup);
    worker.port.on("requestBookmarks", function (url) {
        var folders = blacklistHandler.getFolders();
        console.log(folders);

        worker.port.emit("loadBookmarks", folders);
    });
    worker.port.on("requestInitData", function (url) {
        var folders = blacklistHandler.getFolders();
        console.log(folders);
        worker.port.emit("loadBookmarks", folders);

        console.log("getting blacklist");
        var blacklist = storageHandler.getBlacklistedFolders();
        console.log(blacklist);
        worker.port.emit("loadBlacklist", blacklist);
    });
    worker.port.on("addToBlacklist", function (folderId) {
        storageHandler.addBlacklistedFolder(folderId);
        sorter.setBlacklist(storageHandler.getBlacklistedFolders());
    });
    worker.port.on("removeToBlacklist", function (folderId) {
        storageHandler.removeBlacklistedFolder(folderId);
        sorter.setBlacklist(storageHandler.getBlacklistedFolders());
    });
    worker.port.on("openBaseSettings", openBaseSettings);
    worker.port.on("close", function () {
        worker.tab.close();
    });
    worker.on('detach', function () {
        detachWorker(this, workers);
    });
    worker.on("error", function (error) {
        console.log("worker error:");
        console.log(error);
    });
}

function initPageMod() {
    if (optionPageMod === undefined) {
        optionPageMod = pageMod.PageMod({
            include: data.url("advancedOptions/advancedOptions.html"),
            contentScriptFile: data.url("advancedOptions/advancedOptions.js"),
            onAttach: attachPageModWorker,
            onError: function (error) {
                console.log("optionPageMod error: ");
                console.log(error);
            }
        });
    }
}

function openAdvancedTab() {
    var myTabUrl = data.url("advancedOptions/advancedOptions.html");
    var advancedTab = activateTabIfOpen(myTabUrl);

    initPageMod();

    if (advancedTab === undefined) {
        tabs.open(myTabUrl);
    }
}

exports.init = init;
exports.openTab = openAdvancedTab;
