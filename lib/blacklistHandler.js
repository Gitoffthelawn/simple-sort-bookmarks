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


/*
This module will scan the bookmark collection and will build an array of object
representing all the folders with the parent-child information together with
the ID and the title of the folders.
*/

"use strict";
var {
    Cc, Ci
} = require("chrome");
var historyService = Cc["@mozilla.org/browser/nav-history-service;1"]
    .getService(Ci.nsINavHistoryService);
var bmsvc = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
    .getService(Ci.nsINavBookmarksService);
/* Configure the options to obtain only the folders */
var options = historyService.getNewQueryOptions();
options.sortingMode = options.SORT_BY_TITLE_ASCENDING;
options.excludeItems = true;
options.excludeQueries = true;

/*
 Returns an object containing all the bookmarks folders.
 This is required to be able to select a new folder to add into the blacklist.

 Example of folder content:

    [{
        "id": <int>,
        "title": <string>,
        "child": [
            {
                "id": <int>,
                "title": <string>,
                "child": null
            },
            {
                "id": <int>,
                "title": <string>,
                "child": null
            }
        ]
    },
    {
        "id": <int>,
        "title": <string>,
        "child": null
    }]
 */
function getFolders() {
    var folders = [];
    folders.push(getFolder(bmsvc.bookmarksMenuFolder));
    return {
        "bookmarks": folders
    };
}

function getFolder(folderId) {
    //This folder and childs
    var folder = {};

    var folderTitle = bmsvc.getItemTitle(folderId);

    //Get folder content
    var query = historyService.getNewQuery();
    query.setFolders([folderId], 1);
    var result = historyService.executeQuery(query, options);
    var rootNode = result.root;
    rootNode.containerOpen = true;

    var i, node;
    folder.title = folderTitle;
    folder.id = folderId;
    if (rootNode.childCount === 0) {
        folder.child = null;
    } else {
        folder.child = [];
    }

    for (i = 0; i < rootNode.childCount; i++) {
        node = rootNode.getChild(i);
        if (node.type === node.RESULT_TYPE_FOLDER) {
            folder.child.push(getFolder(node.itemId));
        }
    }
    return folder;
}

exports.getFolders = getFolders;
