# TODO: Implement Opportunity Creator Tracking

## Backend Changes
- [ ] 1. Update Opportunity Model - Add `createdBy` and `createdByType` fields
- [ ] 2. Update opportunityController.js - Modify create/update/delete to handle both roles
- [ ] 3. Update opportunityRoutes.js - Add route for NGO to get all opportunities

## Frontend Changes
- [ ] 4. Update api.js - Add getAllOpportunitiesForNgo function
- [ ] 5. Update NgoDashboard.jsx - Show all opportunities with delete access
- [ ] 6. Update VolunteerDashboard.jsx - Show only own opportunities
- [ ] 7. Update Opportunities.jsx - Add "Created by" badge to each opportunity
