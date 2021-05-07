# github-pages-test
Dummy repo to test out and sandbox github pages

## Style notes
- For announcements and campaigns: nameShort is optional and not needed at all if name is already short

### To-do
- Add settings (and script!) to About page
- Fix detail view expanding/collapsing when checking done with instant update off
- Change hideDone to showDone since it's somewhat reversed at the moment and would mean they both start enabled
- Fix initial state of settings switches to use the saved settings, maybe start unchecked before loading settings

- Limit detail view to one expanded row at a time
- Include boosts in various views
- A way of saying start/end of maintenance - I'm thinking a dot-line beneath the time with a tooltip like "Est. Maintenance" - Tooltips are proving to be a pain
- Potential consolidation of duplicate rewards in the unexpanded row (would need quantities for each, could improve aesthetic if I do)
- External: Some form of campaign input mechanism that can spit out the JSON file
- Continued aesthetic improvement

### Probably not
- Potential condensation of campaigns with singular activities and rewards to not use arrays and determine using .typeof (Though this would divide the format...)
