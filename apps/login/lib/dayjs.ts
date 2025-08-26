import _dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// 현재 인스턴스에 tz가 적용됐는지 검사
const hasTZ =
  typeof (_dayjs as any).tz === "function" && typeof (_dayjs() as any).tz === "function";

if (!hasTZ) {
  _dayjs.extend(utc);
  _dayjs.extend(timezone);
}

const dayjs = _dayjs;
export default dayjs;
export { dayjs };
