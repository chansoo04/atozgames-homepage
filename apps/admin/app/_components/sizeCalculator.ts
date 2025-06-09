// TODO: 사이즈 맞춰서 수정 필요
// 기준 비율: 360 * 783
export const mobileSizeCalc = (크기: number, ratio: number, 기준비율?: number) => {
  if (기준비율 === undefined || 기준비율 === null) {
    기준비율 = 2.1;
  }
  if (ratio < 기준비율) {
    const 새로운크기 = Math.round((크기 / 783) * 10000) / 100;
    return `${새로운크기}dvh`;
  }
  if (ratio >= 기준비율) {
    const 새로운크기 = Math.round((크기 / 360) * 10000) / 100;
    return `${새로운크기}dvw`;
  }
};

// 기준 비율: 1920 * 1080
export const desktopSizeCalc = (크기: number, ratio: number, 기준비율?: number) => {
  if (기준비율 === undefined || 기준비율 === null) {
    기준비율 = 0.56;
  }

  if (ratio < 기준비율) {
    const 새로운크기 = Math.round((크기 / 1080) * 10000) / 100;
    return `${새로운크기}dvh`;
  }
  if (ratio >= 기준비율) {
    const 새로운크기 = Math.round((크기 / 1920) * 10000) / 100;
    return `${새로운크기}dvw`;
  }
};
