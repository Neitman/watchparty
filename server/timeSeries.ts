import config from "./config.ts";
import axios from "axios";
import { redis } from "./utils/redis.ts";
import { getStats } from "./utils/getStats.ts";

statsTimeSeries();
setInterval(statsTimeSeries, 5 * 60 * 1000);

async function statsTimeSeries() {
  if (redis) {
    console.time("timeSeries");
    try {
      const stats = await getStats();
      const datapoint: AnyDict = {
        time: new Date(),
        currentUsers: stats.counts.currentUsers,
        currentHttp: stats.counts.currentHttp,
        currentScreenShare: stats.counts.currentScreenShare,
        currentFileShare: stats.counts.currentFileShare,
        currentVideoChat: stats.counts.currentVideoChat,
        chatMessages: stats.counts.chatMessages,
        redisUsage: stats.counts.redisUsage,
      };
      await redis.lpush("timeSeries", JSON.stringify(datapoint));
      await redis.ltrim("timeSeries", 0, 288);
    } catch (e: any) {
      console.warn(`[TIMESERIES] %s when collecting stats`, e.code);
    }
    console.timeEnd("timeSeries");
  }
}
