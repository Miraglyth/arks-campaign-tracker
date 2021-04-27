# github-pages-test
Dummy repo to test out and sandbox github pages

## Style notes
- If campaignName is short, campaignNameShort isn't needed

### To-do
- Add transition to collapse rows of detail view
- Prevent hover for expanded rows of detail view
- Limit detail view to one expanded row at a time
- Unique names for rows of detail view so changing between Ended / Active / Upcoming doesn't retain expansion
- Add Bootstrap tabs for Ended, Active and Upcoming
- Prevent navbar and tabs from leaving top of screen when scrolling
- Include boosts in various views
- A way of saying start/end of maintenance instead of guessing time? (But would need to equate it to time anyway for sorting...)
- Potential condensation of campaigns with singular activities and rewards to not use arrays and determine using .typeof (Though this would divide the format...)
- Potential consolidation of duplicate rewards in the unexpanded row (would need quantities for each)
- Fix left and right padding that gets added to li bullets in Chrome (-1px and 16px respectively) or just ditch bullets
- Center-align all table content except rewards bullets conditional on multiple rewards or just ditch bullets
- Continued aesthetic improvement
- External: Some form of campaign input mechanism that can spit out the JSON file
