# What may be interesting to add

Various ideas in various order:

- Sync addon options
- Is "runInBatchMode()" applicable/usefull/usable?
- Support for locales
- Add more tests, even better if they work

### Default folder

A default folder for the new created bookmarks.
Maybe it's better to create a new tiny addon only for this feature because it's
not really related to addon sorting?

## Conflicts with other addons

If another addon moves automatically a bookmark position then this addon will
move it back. It's possible they go in a loop moving forward and backward the
bookmark forever. Evaluating solutions:

- tell the user not to install two addons doing the same thing :)
- keep track of the activity and notify the user in case of anormal behavior

## Mobile version

I followed this tutorial:

https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Mobile_development

For now:

Using Firefox developer edition 36.0a2 on desktop and firefox 34.0 on mobile
throws this errors:

    TypeError: "Cc['@mozilla.org/browser/nav-bookmarks-service;1'] is undefined"
    TypeError: "Cc['@mozilla.org/browser/nav-history-service;1'] is undefined"

In addition the low-level API of the Firefox Addon-SDK lists as not supported
the modules places/bookmarks and places/history.

Also the API for ui/button/action is not yet supported but the button is not
so important.

For now the mobile version of this addons seams at least postponed.
