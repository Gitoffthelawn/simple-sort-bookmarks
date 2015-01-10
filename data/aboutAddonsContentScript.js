"use strict";

/* global self, AddonManager, unsafeWindow */

(function () {

var addonId = self.options.addonId;

/*
Solution found in:
http://stackoverflow.com/questions/22593454/has-ff-addon-sdk-an-api-to-open-settings-page
*/
self.port.on("activateAddonsSettings", function (data) {
    AddonManager.getAddonByID(addonId, function(aAddon) {
        unsafeWindow.gViewController.commands.cmd_showItemDetails.doCommand(aAddon, true);
     });
});

}());
