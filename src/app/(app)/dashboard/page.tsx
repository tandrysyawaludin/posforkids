import Link from "next/link";
import BigButton from "@/components/BigButton";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="text-center py-6">
        <div className="text-7xl mb-3">🏪</div>
        <h1 className="text-3xl font-black text-[#2d1b4e]">Your Shop</h1>
        <p className="text-gray-600 font-semibold mt-2">
          What do you want to do today?
        </p>
      </div>

      <div className="grid gap-4">
        <Link href="/sell">
          <BigButton color="pink" className="w-full" size="xl">
            <span className="text-4xl">🛒</span>
            Start Selling!
          </BigButton>
        </Link>

        <Link href="/tables">
          <BigButton color="orange" className="w-full" size="xl">
            <span className="text-4xl">🪑</span>
            Table Activity
          </BigButton>
        </Link>

        <Link href="/history">
          <BigButton color="yellow" className="w-full" size="xl">
            <span className="text-4xl">📜</span>
            Sales History
          </BigButton>
        </Link>

        <Link href="/items">
          <BigButton color="blue" className="w-full" size="xl">
            <span className="text-4xl">📦</span>
            Manage Items
          </BigButton>
        </Link>

        <Link href="/profile">
          <BigButton color="purple" className="w-full" size="xl">
            <span className="text-4xl">😊</span>
            My Profile
          </BigButton>
        </Link>
      </div>

      <div className="bg-white/80 rounded-3xl p-6 text-center">
        <h2 className="text-xl font-extrabold text-[#2d1b4e] mb-3">
          💡 How to Play
        </h2>
        <div className="space-y-2 text-gray-700 font-semibold text-left">
          <p>1️⃣ Add items with a photo and a code</p>
          <p>2️⃣ Write the code on paper 📄</p>
          <p>3️⃣ Scan the paper to sell items! 🔍</p>
          <p>4️⃣ Pick a table for restaurant play 🪑</p>
          <p>5️⃣ Get paid with cash or credit 💰</p>
          <p>6️⃣ Send receipt on WhatsApp! 📱</p>
        </div>
      </div>
    </div>
  );
}
