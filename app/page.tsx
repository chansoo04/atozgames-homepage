import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default async function App() {
  return (
    <>
      <div className="flex-col items-center bg-gray-100 h-screen">작업중인 페이지입니다</div>
      <div className="h-screen">asdf</div>
    </>
  );
}
