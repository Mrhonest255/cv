import React from "react";
import type { Resume } from "@/lib/types";

// A more polished professional layout with a colored sidebar and clean sections
export default function ProfessionalTemplate({ resume }: { resume: Resume }) {
  const { personalInfo } = resume;
  return (
    <div className="flex border rounded-lg overflow-hidden text-sm bg-white dark:bg-neutral-900 shadow-md">
      {/* Sidebar */}
      <div className="w-48 bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-4 space-y-4">
        <div>
          <h1 className="text-lg font-bold leading-tight">{personalInfo.fullName || 'Jina Kamili'}</h1>
          <p className="text-xs opacity-90">{personalInfo.location || 'Mahali'}</p>
        </div>
        <div className="space-y-1 text-xs">
          {personalInfo.email && <p className="break-all">{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.linkedin && <p className="truncate">{personalInfo.linkedin}</p>}
          {personalInfo.portfolio && <p className="truncate">{personalInfo.portfolio}</p>}
        </div>
        <div className="pt-2 border-t border-white/20">
          <h2 className="font-semibold text-xs tracking-wide">UJUZI</h2>
          <ul className="mt-1 space-y-1">
            {resume.skills.slice(0,8).map(s => (
              <li key={s.id} className="flex justify-between"><span>{s.name || 'Skill'}</span><span className="opacity-70">{s.level}/5</span></li>
            ))}
            {resume.skills.length === 0 && <li className="opacity-60">No skills yet</li>}
          </ul>
        </div>
        {resume.languages.length > 0 && (
          <div className="pt-2 border-t border-white/20">
            <h2 className="font-semibold text-xs tracking-wide">LUGHA</h2>
            <ul className="mt-1 space-y-1">
              {resume.languages.slice(0,5).map(l => (
                <li key={l.id}>{l.name} - <span className="opacity-70">{l.proficiency}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {resume.summary && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">MUHTASARI</h2>
            <p className="mt-1 leading-relaxed text-xs whitespace-pre-line">
              {resume.summary}
            </p>
          </section>
        )}

        {resume.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">UZOEFU WA KAZI</h2>
            <div className="mt-2 space-y-3">
              {resume.experience.map(exp => (
                <div key={exp.id} className="border-b pb-2 last:border-none">
                  <div className="flex justify-between">
                    <span className="font-medium">{exp.title || 'Cheo'}</span>
                    <span className="text-xs opacity-70">{exp.startDate || 'YYYY-MM'} - {exp.current ? 'Sasa' : (exp.endDate || 'YYYY-MM')}</span>
                  </div>
                  <p className="text-xs italic opacity-80">{exp.company || 'Kampuni'}, {exp.location || 'Mahali'}</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    {exp.description.filter(Boolean).slice(0,5).map((d,i) => (
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
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">ELIMU</h2>
            <div className="mt-2 space-y-2">
              {resume.education.map(edu => (
                <div key={edu.id} className="text-xs">
                  <p className="font-medium">{edu.degree || 'Shahada'} - {edu.institution || 'Taasisi'}</p>
                  <p className="opacity-70">{edu.location || 'Mahali'} | {edu.startDate || 'YYYY-MM'} - {edu.current ? 'Sasa' : (edu.endDate || 'YYYY-MM')}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">MIRADI</h2>
            <div className="mt-2 space-y-2">
              {resume.projects.slice(0,4).map(p => (
                <div key={p.id} className="text-xs">
                  <p className="font-medium">{p.title}</p>
                  <p className="opacity-70 text-[11px] leading-snug">{p.description}</p>
                  {p.technologies?.length > 0 && (
                    <p className="text-[11px] mt-1"><span className="font-medium">Tech:</span> {p.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.certifications.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">VYETI</h2>
            <ul className="mt-2 space-y-1">
              {resume.certifications.slice(0,6).map(c => (
                <li key={c.id} className="text-[11px]">
                  <span className="font-medium">{c.name}</span> - {c.issuer} ({c.date})
                </li>
              ))}
            </ul>
          </section>
        )}

        {resume.interests.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">MASLAHI</h2>
            <p className="mt-1 text-[11px]">{resume.interests.join(', ')}</p>
          </section>
        )}

        {resume.references && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-400">MAREJEO</h2>
            <p className="mt-1 text-[11px] whitespace-pre-line">{resume.references}</p>
          </section>
        )}
      </div>
    </div>
  );
}
