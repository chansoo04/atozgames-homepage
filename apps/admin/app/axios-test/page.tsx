"use client";
import { useEffect } from "react";
import axios from "lib/axios";

export default function Page() {
  useEffect(() => {
    test();
  }, []);

  const test = async () => {
    const result = await axios.get("test");
    console.log(result, "result");
  };

  return (
    <>
      <div>악시오스 테ㅡ트</div>
    </>
  );
}
