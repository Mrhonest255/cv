import React from "react";
import type { Resume } from "@/lib/types";

// Ordered timeline-like template focusing on clear section ordering
export default function OrderedTemplate({ resume }: { resume: Resume }) {
  const { personalInfo } = resume;
  return (
    <div className="border rounded-lg p-6 text-sm bg-white dark:bg-neutral-900 shadow">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold">{personalInfo.fullName || 'Jina Kamili'}</h1>
        <p className="text-xs opacity-70">
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
        </p>
      </header>

      {resume.summary && (
        <section className="mb-4">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">01 • Muhtasari</h2>
          <p className="mt-1 text-xs whitespace-pre-line">{resume.summary}</p>
        </section>
      )}

      {resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">02 • Uzoefu</h2>
          <ol className="mt-2 space-y-3">
            {resume.experience.map(exp => (
              <li key={exp.id} className="relative pl-6">
                <span className="absolute left-0 top-1 w-3 h-3 rounded-full bg-indigo-500" />
                <div className="text-xs">
                  <p className="font-medium">{exp.title || 'Cheo'} • {exp.company || 'Kampuni'}</p>
                  <p className="opacity-70">{exp.location || 'Mahali'} • {exp.startDate || 'YYYY-MM'} - {exp.current ? 'Sasa' : (exp.endDate || 'YYYY-MM')}</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    {exp.description.filter(Boolean).slice(0,5).map((d,i)=>(
                      <li key={i} className="leading-snug">{d}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">03 • Elimu</h2>
          <ul className="mt-2 space-y-2">
            {resume.education.map(edu => (
              <li key={edu.id} className="text-xs">
                <p className="font-medium">{edu.degree || 'Shahada'} • {edu.institution || 'Taasisi'}</p>
                <p className="opacity-70">{edu.location || 'Mahali'} • {edu.startDate || 'YYYY-MM'} - {edu.current ? 'Sasa' : (edu.endDate || 'YYYY-MM')}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">04 • Ujuzi</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {resume.skills.slice(0,20).map(s => (
              <span key={s.id} className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[11px]">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {resume.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">05 • Miradi</h2>
          <ul className="mt-2 space-y-2">
            {resume.projects.slice(0,4).map(p => (
              <li key={p.id} className="text-xs">
                <p className="font-medium">{p.title}</p>
                <p className="opacity-70 leading-snug">{p.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resume.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">06 • Vyeti</h2>
          <ul className="mt-2 text-xs space-y-1">
            {resume.certifications.slice(0,6).map(c => (
              <li key={c.id}><span className="font-medium">{c.name}</span> — {c.issuer} ({c.date})</li>
            ))}
          </ul>
        </section>
      )}

      {resume.interests.length > 0 && (
        <section className="mb-2">
          <h2 className="font-semibold text-indigo-700 dark:text-indigo-400">07 • Maslahi</h2>
          <p className="mt-1 text-xs">{resume.interests.join(', ')}</p>
        </section>
      )}
    </div>
  );
}
