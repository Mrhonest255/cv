import Link from "next/link";
import { FileText, Mail, Target, Home } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          JobKit Pro
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Jifunze kutengeneza CV na barua za maombi kwa kutumia AI – inatumia mtandao na bila mtandao!
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Link href="/resume" className="group">
            <div className="p-8 rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg bg-card">
              <FileText className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold mb-2">CV Builder</h2>
              <p className="text-muted-foreground">
                Tengeneza CV yako kwa urahisi, hifadhi ndani ya kifaa chako
              </p>
            </div>
          </Link>

          <Link href="/letter" className="group">
            <div className="p-8 rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg bg-card">
              <Mail className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold mb-2">Cover Letter Studio</h2>
              <p className="text-muted-foreground">
                Barua za maombi zenye akili kwa msaada wa Gemini AI
              </p>
            </div>
          </Link>

          <Link href="/match" className="group">
            <div className="p-8 rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg bg-card">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold mb-2">Smart Job Match</h2>
              <p className="text-muted-foreground">
                Angalia CV yako inalingana vipi na kazi unayotaka
              </p>
            </div>
          </Link>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-semibold mb-4">✨ Vipengele Muhimu</h3>
          <ul className="grid md:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Inatumia bila mtandao (PWA)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>AI ya Gemini 2.5</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Export PDF & DOCX</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Usalama wa API key</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Kiswahili & English</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Smart keyword matching</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
