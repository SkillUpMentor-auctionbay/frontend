import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center gap-8">
      <Card className="w-2/3">
        <CardHeader className="text-2xl font-bold">Welcome to Auction Bay!</CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Your one-stop platform for all auction needs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
