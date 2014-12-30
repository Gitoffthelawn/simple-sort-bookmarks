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
This class will display a "save as" dialog to allow the user to backup
the current bookmark collection.
*/
var {
    Cc, Ci, Cu
} = require('chrome');
/* global PlacesBackups */
Cu.import("resource://gre/modules/PlacesBackups.jsm");
const nsIFilePicker = Ci.nsIFilePicker;
var fp = Cc["@mozilla.org/filepicker;1"]
    .createInstance(Ci.nsIFilePicker);
var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
    .getService(Ci.nsIWindowMediator);
var recentWindow = wm.getMostRecentWindow("navigator:browser");

function getTimestamp() {

    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    var today = new Date();
    return today.getUTCFullYear() +
        '-' + pad(today.getUTCMonth() + 1) +
        '-' + pad(today.getUTCDate());
}

/*
Display the "save as" dialog and get the destination file
*/
function getFileFromUser() {

    fp.defaultString = "bookmarks-" + getTimestamp() + ".json";
    fp.init(recentWindow, "Dialog Title", nsIFilePicker.modeSave);
    fp.appendFilter("JSON files", "*.json");
    fp.appendFilters(nsIFilePicker.filterAll);


    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        var file = fp.file;
        return file;
    }
}

function backup() {
    var file = getFileFromUser();
    console.log("User will backup in " + file.path);
    PlacesBackups.saveBookmarksToJSONFile(file.path);
}

exports.backup = backup;
