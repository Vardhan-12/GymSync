const calculateWorkoutVolume = (exercises = []) => {
  let totalVolume = 0;

  for (const exercise of exercises) {
    const { sets, reps, weight } = exercise;

    if (
      typeof sets === "number" &&
      typeof reps === "number" &&
      typeof weight === "number"
    ) {
      totalVolume += sets * reps * weight;
    }
  }

  return totalVolume;
};

module.exports = calculateWorkoutVolume;