const 기준비율 = 2.1;

// TODO: 사이즈 맞춰서 수정 필요
export const sizeCalc = (크기: number, ratio: number) => {
  if (ratio < 기준비율) {
    const 새로운크기 = Math.round((크기 / 783) * 10000) / 100;
    return `${새로운크기}dvh`;
  }
  if (ratio >= 기준비율) {
    const 새로운크기 = Math.round((크기 / 360) * 10000) / 100;
    return `${새로운크기}dvw`;
  }
};
