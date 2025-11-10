import React from "react";
import type { Resume } from "@/lib/types";

// Glassmorphism template with frosted panels and accent chips
export default function GlassTemplate({ resume }: { resume: Resume }) {
  const { personalInfo } = resume;
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-indigo-500/20" />
      <div className="relative border rounded-xl p-6 backdrop-blur-xl bg-white/50 dark:bg-white/5 shadow-xl">
        <header className="mb-4">
          <h1 className="text-2xl font-bold gradient-title">{personalInfo.fullName || 'Jina Kamili'}</h1>
          <p className="text-xs opacity-80">
            {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
          </p>
        </header>
        {resume.summary && (
          <section className="mb-4">
            <h2 className="text-xs font-semibold tracking-wide opacity-80">Muhtasari</h2>
            <p className="mt-1 text-[11px] leading-relaxed whitespace-pre-line">{resume.summary}</p>
          </section>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            {resume.experience.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide opacity-80">Uzoefu wa Kazi</h2>
                <div className="mt-2 space-y-3">
                  {resume.experience.map(exp => (
                    <div key={exp.id} className="rounded-lg p-3 bg-white/70 dark:bg-white/5 border">
                      <div className="flex justify-between">
                        <span className="font-medium">{exp.title || 'Cheo'}</span>
                        <span className="text-[11px] opacity-70">{exp.startDate || 'YYYY-MM'} - {exp.current ? 'Sasa' : (exp.endDate || 'YYYY-MM')}</span>
                      </div>
                      <p className="text-xs opacity-80">{exp.company || 'Kampuni'} • {exp.location || 'Mahali'}</p>
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
            {resume.projects.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide opacity-80">Miradi</h2>
                <div className="mt-2 space-y-2">
                  {resume.projects.slice(0,4).map(p => (
                    <div key={p.id} className="rounded-lg p-3 bg-white/70 dark:bg-white/5 border">
                      <p className="text-xs font-medium">{p.title}</p>
                      <p className="opacity-70 text-[11px] leading-snug">{p.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="col-span-1 space-y-4">
            {resume.skills.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide opacity-80">Ujuzi</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resume.skills.slice(0,20).map(s => (
                    <span key={s.id} className="px-2 py-1 rounded-full text-[11px] border bg-white/60 dark:bg-white/5">
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {resume.education.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide opacity-80">Elimu</h2>
                <ul className="mt-1 space-y-2">
                  {resume.education.map(edu => (
                    <li key={edu.id} className="text-xs">
                      <p className="font-medium">{edu.degree || 'Shahada'}</p>
                      <p className="opacity-70">{edu.institution || 'Taasisi'} • {edu.location || 'Mahali'}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {resume.languages.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide opacity-80">Lugha</h2>
                <ul className="mt-1 space-y-1 text-[11px]">
                  {resume.languages.slice(0,6).map(l => (
                    <li key={l.id}>{l.name} • <span className="opacity-70">{l.proficiency}</span></li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
