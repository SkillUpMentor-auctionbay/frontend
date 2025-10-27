import { ButtonShowcase } from "@/components/ui/button-showcase";
import { Card, CardContent, CardHeader } from "../components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center gap-8">
      <ButtonShowcase />
    </div>
  );
}
