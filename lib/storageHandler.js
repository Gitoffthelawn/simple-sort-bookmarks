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

/*
This module is an interface to the simple-storage system.
Simple-storage is used to save the advanced options.
*/
var ss = require("sdk/simple-storage");

//Blacklisted folders
if (!ss.storage.blacklist) {
    ss.storage.blacklist = [];
}

function init() {
    ss.storage.blacklist = [];
}

function addBlacklistedFolder(folderId) {
    console.log("I'm going to add to blacklist the folder id " + folderId);
    if (ss.storage.blacklist.indexOf(folderId) === -1) {
        ss.storage.blacklist.push(folderId);
    }
    console.log(ss.storage.blacklist);
}

function removeBlacklistedFolder(folderId) {
    console.log("I'm going to remove from blaclist folder id " + folderId);
    var blacklist = ss.storage.blacklist,
        tempList = [],
        i;
    for (i = 0; i < blacklist.length; i++) {
        if (blacklist[i] !== folderId) {
            tempList.push(blacklist[i]);
        }
    }
    ss.storage.blacklist = tempList;
    console.log(ss.storage.blacklist);
}

function getBlacklistedFolders() {
    return ss.storage.blacklist;
}

function deleteAllOptions() {
    delete ss.storage.blacklist;
}

exports.addBlacklistedFolder = addBlacklistedFolder;
exports.removeBlacklistedFolder = removeBlacklistedFolder;
exports.getBlacklistedFolders = getBlacklistedFolders;
exports.deleteAllOptions = deleteAllOptions;
