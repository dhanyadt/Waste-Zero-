import API from './api.js';

// Get applicant count for opportunity (for NGO dashboard preview)
export const getOpportunityApplicantsCount = (oppId) => API.get(`/opportunities/${oppId}/applicants-count`);

// Get skill match count for opportunity
export const getMatchCountForOpportunity = (oppId) => API.get(`/opportunities/${oppId}/match-count`);

// All other opportunity functions already in api.js
