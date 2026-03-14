// utils/matchUtils.js

function calculateMatchScore(volunteer, opportunity) {
  let score = 0;

  const volunteerSkills = volunteer.skills || [];
  const requiredSkills = opportunity.requiredSkills || [];

  // Skill overlap
  const matchingSkills = volunteerSkills.filter(skill =>
    requiredSkills.includes(skill)
  );

  score += matchingSkills.length * 10;

  // Location match
  if (
    volunteer.location &&
    opportunity.location &&
    volunteer.location.toLowerCase() === opportunity.location.toLowerCase()
  ) {
    score += 5;
  }

  return {
    score,
    matchingSkills,
  };
}

module.exports = { calculateMatchScore };