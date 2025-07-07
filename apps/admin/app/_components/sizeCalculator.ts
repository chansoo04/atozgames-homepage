// 기준 비율: 360 * 783
import { isNil } from "@toss/utils";

export const paginationMobileSizeCalc = (
  크기: number,
  ratio: number,
  기준너비?: number,
  기준높이?: number,
) => {
  let 기준비율 = 2.1;
  const 너비 = isNil(기준너비) ? 360 : 기준너비;
  const 높이 = isNil(기준높이) ? 783 : 기준높이;
  if (!isNil(기준높이) && !isNil(기준너비)) {
    기준비율 = Math.round((기준높이 / 기준너비) * 10) / 10;
    // console.log(기준비율);
  }
  // if (기준비율 === undefined || 기준비율 === null) {
  //   기준비율 = 2.1;
  // }
  if (ratio < 기준비율) {
    const 새로운크기 = Math.round((크기 / 높이) * 10000) / 100;
    return `${새로운크기}dvh`;
  }
  if (ratio >= 기준비율) {
    const 새로운크기 = Math.round((크기 / 너비) * 10000) / 100;
    return `${새로운크기}dvw`;
  }
};

export const mobileSizeCalc = (
  크기: number,
  ratio: number,
  기준너비?: number,
  기준높이?: number,
) => {
  let 기준비율 = 2.1;
  const 너비 = isNil(기준너비) ? 360 : 기준너비;
  const 높이 = isNil(기준높이) ? 783 : 기준높이;
  if (!isNil(기준높이) && !isNil(기준너비)) {
    기준비율 = Math.round((기준높이 / 기준너비) * 10) / 10;
    // console.log(기준비율);
  }
  // if (기준비율 === undefined || 기준비율 === null) {
  //   기준비율 = 2.1;
  // }
  if (ratio < 기준비율) {
    const 새로운크기 = Math.round((크기 / 높이) * 10000) / 100;
    return `${새로운크기}vh`;
  }
  if (ratio >= 기준비율) {
    const 새로운크기 = Math.round((크기 / 너비) * 10000) / 100;
    return `${새로운크기}vw`;
  }
};

// 기준 비율: 1920 * 1080
export const desktopSizeCalc = (크기: number, ratio: number, 기준비율?: number) => {
  return `${크기}px`;
  // if (기준비율 === undefined || 기준비율 === null) {
  //   기준비율 = 0.56;
  // }
  //
  // if (ratio < 기준비율) {
  //   const 새로운크기 = Math.round((크기 / 1080) * 10000) / 100;
  //   return `${새로운크기}dvh`;
  // }
  // if (ratio >= 기준비율) {
  //   const 새로운크기 = Math.round((크기 / 1920) * 10000) / 100;
  //   return `${새로운크기}dvw`;
  // }
};
