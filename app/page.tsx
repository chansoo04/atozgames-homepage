import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default async function App() {

  return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
          작업중인 페이지입니다
      </div>
  );
}
