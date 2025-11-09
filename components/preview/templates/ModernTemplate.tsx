import React from "react";
import type { Resume } from "@/lib/types";

export default function ModernTemplate({ resume }: { resume: Resume }) {
  const pi = resume.personalInfo;
  return (
    <div className="rounded-xl overflow-hidden shadow-lg border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="px-8 py-6 bg-slate-950/60 backdrop-blur border-b border-slate-700">
        <h1 className="text-3xl font-extrabold tracking-tight">{pi.fullName || "Your Name"}</h1>
        <p className="text-sm mt-2 text-slate-300">
          {[pi.email||'', pi.phone||'', pi.location||''].filter(Boolean).join(' • ')}
        </p>
      </div>
      <div className="p-8 space-y-8">
        {resume.summary && (
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-400">PROFILE</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{resume.summary}</p>
          </section>
        )}
        {resume.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-400">EXPERIENCE</h2>
            <div className="mt-3 space-y-4">
              {resume.experience.map(e => (
                <div key={e.id} className="group">
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <div className="font-semibold text-sm">{e.title} <span className="text-slate-400 font-normal">@ {e.company}</span></div>
                    <div className="text-xs text-slate-400">{e.startDate} – {e.current ? 'Present' : e.endDate}</div>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{e.location}</div>
                  <ul className="list-disc ml-5 space-y-1 text-sm marker:text-sky-400">
                    {e.description.filter(Boolean).map((d,i)=>(<li key={i}>{d}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {resume.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-400">EDUCATION</h2>
            <div className="mt-3 space-y-2 text-sm">
              {resume.education.map(ed => (
                <div key={ed.id}>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">{ed.degree} — {ed.institution}</span>
                    <span className="text-xs text-slate-400">{ed.startDate} – {ed.current? 'Present': ed.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-400">{ed.location}</div>
                </div>
              ))}
            </div>
          </section>
        )}
        {resume.skills?.length>0 && (
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-slate-400">SKILLS</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {resume.skills.map(s => (
                <span key={s.id} className="px-3 py-1 bg-slate-800/60 border border-slate-700 rounded-full text-xs">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
