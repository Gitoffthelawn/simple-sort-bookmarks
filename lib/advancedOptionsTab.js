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
var data = require("sdk/self").data;

var blacklistHandler = require("./blacklistHandler");
var backup = require("./backupBookmarks");

var storageHandler;
var sorter;
//PageMod for the advanced option tab
var optionPageMod;
//Array of workers for optionPage, this is required to destroy the detached workers
var workers = [];

function init(newSorter, newStorageHandler) {
    sorter = newSorter;
    storageHandler = newStorageHandler;
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

function openTab() {
    var mustOpenNewTab = true;
    var myTabUrl = data.url("advancedOptions/advancedOptions.html");

    initPageMod();

    //Activate the tab if already open
    for (let tab of tabs) {
        console.log(tab.url);
        if (tab.url === myTabUrl) {
            tab.activate();
            mustOpenNewTab = false;
        }
    }

    if (mustOpenNewTab) {
        tabs.open(myTabUrl);
    }
}

exports.init = init;
exports.openTab = openTab;
