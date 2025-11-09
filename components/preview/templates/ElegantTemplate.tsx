import React from "react";
import type { Resume } from "@/lib/types";

// Elegant template with a bold header banner and clean two-column layout
export default function ElegantTemplate({ resume }: { resume: Resume }) {
  const { personalInfo } = resume;
  return (
    <div className="border rounded-lg overflow-hidden text-sm bg-white dark:bg-neutral-900 shadow-lg">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-400 text-white p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{personalInfo.fullName || 'Jina Kamili'}</h1>
        <p className="text-xs opacity-90 mt-1">
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Left column */}
        <div className="col-span-1 space-y-6">
          {resume.summary && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">MUHTASARI</h2>
              <p className="mt-1 text-[11px] leading-relaxed whitespace-pre-line">{resume.summary}</p>
            </section>
          )}
          {resume.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">UJUZI</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {resume.skills.slice(0,18).map(s => (
                  <span key={s.id} className="px-2 py-1 rounded bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200 text-[11px]">{s.name}</span>
                ))}
              </div>
            </section>
          )}
          {resume.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">LUGHA</h2>
              <ul className="mt-1 text-[11px] space-y-1">
                {resume.languages.slice(0,6).map(l => (
                  <li key={l.id}>{l.name} • <span className="opacity-70">{l.proficiency}</span></li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {/* Right column */}
        <div className="col-span-2 space-y-6">
          {resume.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">UZOEFU WA KAZI</h2>
              <div className="mt-2 space-y-3">
                {resume.experience.map(exp => (
                  <div key={exp.id} className="border-l-2 border-fuchsia-500 pl-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{exp.title || 'Cheo'}</span>
                      <span className="text-[11px] opacity-70">{exp.startDate || 'YYYY-MM'} - {exp.current ? 'Sasa' : (exp.endDate || 'YYYY-MM')}</span>
                    </div>
                    <p className="text-xs italic opacity-80">{exp.company || 'Kampuni'} • {exp.location || 'Mahali'}</p>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      {exp.description.filter(Boolean).slice(0,5).map((d,i)=>(
                        <li key={i} className="text-[11px] leading-snug">{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.education.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">ELIMU</h2>
              <div className="mt-2 space-y-2">
                {resume.education.map(edu => (
                  <div key={edu.id} className="text-xs">
                    <p className="font-medium">{edu.degree || 'Shahada'} • {edu.institution || 'Taasisi'}</p>
                    <p className="opacity-70">{edu.location || 'Mahali'} • {edu.startDate || 'YYYY-MM'} - {edu.current ? 'Sasa' : (edu.endDate || 'YYYY-MM')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.projects.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide text-fuchsia-700 dark:text-fuchsia-400">MIRADI</h2>
              <div className="mt-2 space-y-2">
                {resume.projects.slice(0,4).map(p => (
                  <div key={p.id} className="text-xs">
                    <p className="font-medium">{p.title}</p>
                    <p className="opacity-70 text-[11px] leading-snug">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
