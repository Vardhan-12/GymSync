// services/predictionService.js

const Session = require("../models/Session");

/*
  SMART BEST TIME PREDICTION

  Logic:
  1. Group all sessions by hour (0–23)
  2. Count how many users come in each hour
  3. Find hour with LOWEST crowd
*/

exports.getBestGymTime = async () => {
  try {

    // 🔥 Step 1: group sessions by hour
    const result = await Session.aggregate([
      {
        $project: {
          hour: {
            $hour: {
              date: "$startTime",
              timezone: "Asia/Kolkata"
            }
          }
        }
      },
      {
        $group: {
          _id: "$hour",
          totalSessions: { $sum: 1 }
        }
      },
      {
        $sort: { totalSessions: 1 } // ASC → least crowded first
      }
    ]);

    // ❌ no data
    if (result.length === 0) {
      return null;
    }

    // ✅ best time = least crowded hour
    const best = result[0];

    return {
      bestHour: best._id,
      expectedCrowd: best.totalSessions
    };

  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};