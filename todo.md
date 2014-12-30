# What may be interesting to add

Various ideas in various order:

- Mobile version
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
