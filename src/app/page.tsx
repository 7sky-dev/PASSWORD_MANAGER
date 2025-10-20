"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Terminal,
  Database,
  Github,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("auth_token"));
    let redirectTimer: NodeJS.Timeout;

    const checkToken = async () => {
      try {
        const res = await fetch("/api/check-token");
        const data = await res.json();

        if (data.valid) {
          setTokenValid(true);
          redirectTimer = setTimeout(() => router.replace("/panel"), 500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkToken();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router]);

  const handleLiveDemo = () => {
    router.push(hasToken ? "/panel" : "/login");
  };

  const [lines, setLines] = useState<
    {
      left: string;
      height: string;
      animationDelay: string;
      animationDuration: string;
    }[]
  >([]);

  useEffect(() => {
    const generated = [...Array(30)].map(() => ({
      left: `${Math.random() * 100}%`,
      height: `${Math.random() * 100 + 50}px`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setLines(generated);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-400" />,
      title: "AES_256_ENCRYPTION",
      description:
        "Passwords are securely hashed with AES-256, providing strong resistance against brute-force attacks.",
      code: "AES.encrypt(password)",
    },
    {
      icon: <Terminal className="w-8 h-8 text-green-400" />,
      title: "PASSWORD_GENESIS",
      description:
        "Generate cryptographically secure passwords using entropy from multiple randomness sources.",
      code: "generateSecure(128bit)",
    },
    {
      icon: <Database className="w-8 h-8 text-green-400" />,
      title: "CLIENT_ENCRYPTION",
      description:
        "All data is encrypted client-side. Only you can decrypt and access your vault.",
      code: "decrypt_local_only()",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">
        {" "}
        <div className="text-center">
          {" "}
          <Terminal className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />{" "}
          <p className="text-lg text-gray-300">Checking authentication...</p>{" "}
        </div>{" "}
      </div>
    );
  }

  if (tokenValid) return null;

  return (
    <div className="min-h-screen bg-black text-white font-mono relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-gray-800/20"></div>
        <div className="absolute inset-0 bg-slate-900/10"></div>
        {lines &&
          lines.map((style, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-slate-800/15 to-transparent animate-pulse"
              style={style}
            />
          ))}

        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
          linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
        `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-green-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div
                className="flex items-center space-x-2 sm:space-x-3 select-none min-w-0 flex-1 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-400 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                  <Terminal className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-xl font-bold text-green-400 tracking-widest truncate">
                    PASSWORD_MANAGER
                  </h1>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Password Management System
                  </p>
                </div>
              </div>

              {/* Desktop buttons */}
              <div className="hidden md:flex items-center space-x-8">
                <Button
                  className="bg-green-500/20 text-green-300 font-semibold hover:bg-green-400/20 shadow-sm hover:shadow-green-500/20 flex items-center cursor-pointer border border-green-500/30"
                  onClick={() =>
                    window.open(
                      "https://github.com/7sky-dev/PASSWORD_MANAGER",
                      "_blank"
                    )
                  }
                >
                  <Github className="w-5 h-5 mr-2" />
                  View Source Code
                </Button>
              </div>

              {/* Mobile menu toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-green-500/30">
              <div className="px-4 py-6 space-y-4">
                <Button
                  className="bg-green-500/20 text-green-300 font-semibold hover:bg-green-400/20 shadow-sm hover:shadow-green-500/20 flex items-center cursor-pointer border border-green-500/30 w-full"
                  onClick={() =>
                    window.open(
                      "https://github.com/7sky-dev/PASSWORD_MANAGER",
                      "_blank"
                    )
                  }
                >
                  <Github className="w-5 h-5 mr-2" />
                  View Source Code
                </Button>
              </div>
            </div>
          )}
        </nav>

        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-800/30 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <Badge
              variant="outline"
              className="inline-flex items-center px-4 py-2 bg-green-500/10 text-green-300 border-green-400/40 mb-8 hover:bg-green-500/20 transition-colors backdrop-blur-sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              YOUR SECURE CHOICE
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Secure Your Digital Life with
              <br />
              <span className="text-green-400">Advanced Encryption</span>
            </h1>

            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              A modern password management solution built with enterprise-grade
              security. Zero-knowledge architecture ensures your data stays
              private and secure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={handleLiveDemo}
                className="bg-green-500 text-black font-semibold hover:bg-green-400 shadow-lg hover:shadow-green-500/30 flex items-center cursor-pointer px-6 py-3"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View Live Demo
              </Button>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <Card className="bg-gray-900/80 backdrop-blur-md border border-green-400/30 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-b border-green-400/30 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <h3 className="text-white font-semibold">Password Vault</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-400/50 bg-green-400/10 px-3 py-1"
                  >
                    Secure
                  </Badge>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-gray-700/40">
                  {[
                    {
                      name: "Work Account",
                      domain: "company.com",
                      username: "john.doe@company.com",
                      strength: "Strong",
                      color: "blue",
                      lastUsed: "2 hours ago",
                    },
                    {
                      name: "Personal Email",
                      domain: "gmail.com",
                      username: "personal@gmail.com",
                      strength: "Very Strong",
                      color: "green",
                      lastUsed: "1 day ago",
                    },
                    {
                      name: "GitHub Account",
                      domain: "github.com",
                      username: "developer",
                      strength: "Strong",
                      color: "blue",
                      lastUsed: "3 hours ago",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="px-3 sm:px-6 py-4 sm:py-5 hover:bg-gray-800/30 transition-colors group cursor-default"
                    >
                      <div className="flex sm:hidden flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600/50">
                              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-white font-medium text-sm truncate">
                                {item.name}
                              </h4>
                              <span className="text-gray-400 text-xs flex-shrink-0">
                                {item.domain}
                              </span>
                            </div>
                            <p className="text-gray-300 text-xs mt-0.5 truncate">
                              {item.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pl-11">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-300 font-mono text-xs tracking-wider">
                              ••••••••
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium border ${
                                item.color === "green"
                                  ? "text-green-400 border-green-400/50 bg-green-400/10"
                                  : "text-blue-400 border-blue-400/50 bg-blue-400/10"
                              }`}
                            >
                              {item.strength}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs">
                            {item.lastUsed}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600/50">
                              <Lock className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-white font-medium">
                                {item.name}
                              </h4>
                              <span className="text-gray-400 text-sm">
                                {item.domain}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {item.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-300 font-mono text-sm tracking-wider">
                                ••••••••••••
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium border ${
                                  item.color === "green"
                                    ? "text-green-400 border-green-400/50 bg-green-400/10"
                                    : "text-blue-400 border-blue-400/50 bg-blue-400/10"
                                }`}
                              >
                                {item.strength}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">
                              Last used {item.lastUsed}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="bg-gray-900/60 border-t border-green-400/30 px-6 py-4 text-sm flex justify-between text-gray-300">
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>AES-256 Encrypted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Zero Knowledge</span>
                    </div>
                  </div>
                  <div>3 of 100 passwords used</div>
                </div>
              </Card>

              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 rounded-lg blur-xl"></div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-24 px-4 sm:px-6 lg:px-8 select-none"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/20 to-gray-900/30 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-400 mb-4">
                Core Features
              </h2>
              <p className="text-gray-200 text-lg max-w-2xl mx-auto">
                Advanced security meets intuitive design for the ultimate
                password management experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group relative bg-gray-900/80 backdrop-blur-md border border-gray-700/60 hover:border-green-400/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/20 rounded-xl"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-xl bg-green-400/10 border border-green-400/30 group-hover:bg-green-400/20 group-hover:border-green-400/40 transition-all duration-300">
                        <div className="text-green-400 group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-400 font-mono text-xs bg-green-400/10 border-green-400/40 px-2 py-1"
                      >
                        {feature.code}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
                      {feature.title.replace(/_/g, " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-100 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>

                  <div className="absolute inset-0 bg-gradient-to-t from-green-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          <div className="relative max-w-6xl mx-auto z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-400/60 rounded-lg flex items-center justify-center shadow-lg">
                    <Terminal className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3
                    className="text-xl font-bold text-green-400 cursor-pointer hover:text-green-300 transition-colors duration-300"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    PASSWORD MANAGER
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Secure • Simple • Reliable
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <nav className="flex flex-wrap gap-8">
                  <a
                    href="#"
                    className="text-gray-200 hover:text-green-400 transition-colors duration-300 text-sm font-medium"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="text-gray-200 hover:text-green-400 transition-colors duration-300 text-sm font-medium"
                  >
                    Contact
                  </a>
                  <a
                    href="#"
                    className="text-gray-200 hover:text-green-400 transition-colors duration-300 text-sm font-medium"
                  >
                    Documentation
                  </a>
                </nav>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 border border-green-400/50 text-green-400 bg-green-400/10 hover:bg-green-400/20 hover:border-green-400/70 hover:text-green-300 rounded-lg transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    window.open("https://github.com/7sky-dev", "_blank")
                  }
                >
                  <Github className="w-4 h-4" />
                  <span className="font-medium">GitHub</span>
                </Button>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent mb-8" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-gray-300">
                © 2025 Password Manager. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  AES-256 Encrypted
                </span>
                <span>•</span>
                <span>Built with Next.js</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
