"use client";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function App() {

  return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
          {/* 모바일 */}
          <div className="block sm:hidden text-lg font-bold text-blue-500">
              모바일
          </div>

          {/* 태블릿 */}
          <div className="hidden sm:block md:hidden text-xl font-bold text-green-500">
              태블릿
          </div>

          {/* PC */}
          <div className="hidden md:block text-2xl font-bold text-red-500">
              PC
          </div>
      </div>
  );
}
