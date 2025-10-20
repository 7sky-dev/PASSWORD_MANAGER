"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/panel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative font-mono px-4 sm:px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-gray-800/20"></div>
        <div className="absolute inset-0 bg-slate-900/10"></div>
      </div>

      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 flex items-center text-green-400 hover:text-green-300 transition-colors z-20 text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2 cursor-pointer" />
        <span className="hidden xs:inline">Back</span>
      </button>

      <div className="w-full max-w-md space-y-4 relative z-10">
        <div className="flex justify-center sm:hidden">
          <Badge
            variant="outline"
            className="px-3 py-1.5 bg-green-500/10 text-green-300 border-green-400/40 backdrop-blur-sm text-xs"
          >
            <Shield className="w-3 h-3 mr-1" />
            BCRYPT • Zero Knowledge
          </Badge>
        </div>

        <Card className="w-full bg-gray-900/80 backdrop-blur-md border border-green-400/30 shadow-2xl rounded-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-green-400/50 shadow-lg shadow-green-500/20 flex items-center justify-center">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white">
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                LOGIN_
              </span>
            </CardTitle>
            <p className="mt-2 text-xs sm:text-sm text-gray-400 tracking-wide">
              Enter your credentials to access your vault
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-green-400/40 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-green-400/40 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  required
                />
              </div>

              {error && (
                <div className="text-center text-sm text-red-400">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 shadow-lg hover:shadow-green-500/30 transition text-sm sm:text-base cursor-pointer"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300 text-xs sm:text-sm">
                Don’t have an account?{" "}
                <span
                  onClick={() => router.push("/signup")}
                  className="text-green-400 cursor-pointer hover:underline"
                >
                  Sign up
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="hidden sm:flex justify-center">
          <Badge
            variant="outline"
            className="px-4 py-2 bg-green-500/10 text-green-300 border-green-400/40 backdrop-blur-sm text-sm"
          >
            <Shield className="w-4 h-4 mr-2" />
            BCRYPT • Zero Knowledge
          </Badge>
        </div>
      </div>
    </div>
  );
}
