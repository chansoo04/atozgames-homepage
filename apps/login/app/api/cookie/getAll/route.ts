import { NextRequest, NextResponse } from "next/server";
import { GpCookie, GpSignList, GpSignProvider, PROVIDER_COOKIE_MAP } from "common/cookie";
import { getSessionByProvider } from "../cookie.service";

export async function POST(request: NextRequest) {
  const result: GpCookie = {};
  for (const provider of Object.keys(PROVIDER_COOKIE_MAP)) {
    const session = await getSessionByProvider(provider);
    result[provider as keyof GpCookie] = session || [];
  }

  if (Object.keys(result).length === 0) {
    throw new Error("Cookie not found");
  }

  console.log(result, "result");

  return NextResponse.json(result);
}

// Fe26.2*1*d17dcbe21ab00a5d8b1838869cd7de4c38d9a51708f477340bd26c59b878988d*erla4M44dKUh6HEyfTnqiQ*bOiMd_SLxmWYzEt1gV32MGFGEruROLiNdr7lEwQQ6M8bLxIvG3el_JiPDLHnV-DXZgeqD9rZEDfoSYZ61Izd6XAsZkyhwLRYN5nkjtwKr7lST1I0OXgS4DetVNGSbFYu44Uu3eeO8A7QXna3pZtPmpw975SGkIcmX0vUYMqwZ5ldOJjWnOqT09P-HPDED1KY_MYHpG7jMFioKF9zXzGmydjVzdDyU4CE-BBZMyT5EspNBwZv-i7hywp8jJv2yDJ-*1758034127182*6cde98fd44b97df44100921698ce76569c48be8bd2c1f6839c845daff7a7e82e*G5Ke-Z11UBPm0Di8T_GnsVNXeUrkvzNl4PqnBH_m6MY~2
