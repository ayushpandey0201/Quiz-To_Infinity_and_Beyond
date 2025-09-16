import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TO INFINITY & BEYOND - Quiz Game",
  description: "A production-ready quiz event web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            {/* Footer Credit */}
            <footer className="py-8 text-center border-t border-cyan-500/30 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-sm">
              <div className="mb-5">
                <p className="text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text font-bold text-3xl tracking-wider font-mono mb-3">
                  &lt;TeamCodeLocked/&gt;
                </p>
                <div className="flex justify-center mt-3 space-x-1">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-2">
                Engineered by Ayush Pandey - Tech Head
              </p>
              <p className="text-gray-500 text-xs">
                Next.js 15 • TypeScript • MongoDB • Socket.IO
              </p>
            </footer>

          </div>
        </AuthProvider>
      </body>
    </html>
  );
}