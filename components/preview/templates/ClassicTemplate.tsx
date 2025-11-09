import React from "react";
import type { Resume } from "@/lib/types";

export default function ClassicTemplate({ resume }: { resume: Resume }) {
  const pi = resume.personalInfo;
  return (
    <div className="bg-white text-black rounded-lg shadow border p-6">
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">{pi.fullName || "Your Name"}</h1>
        <p className="text-sm">
          {pi.email || "email@example.com"} • {pi.phone || "+255 700 000 000"} • {pi.location || "Location"}
        </p>
      </div>
      {resume.summary && (
        <section className="mb-4">
          <h2 className="font-semibold tracking-wide text-gray-700">SUMMARY</h2>
          <p className="text-sm leading-relaxed mt-1 whitespace-pre-wrap">{resume.summary}</p>
        </section>
      )}
      {resume.experience?.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold tracking-wide text-gray-700">EXPERIENCE</h2>
          <div className="mt-1 space-y-2">
            {resume.experience.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between text-sm font-medium">
                  <span>{e.title} • {e.company}</span>
                  <span className="text-gray-500">{e.startDate} - {e.current ? "Present" : e.endDate}</span>
                </div>
                <div className="text-xs text-gray-700">{e.location}</div>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  {e.description.filter(Boolean).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
      {resume.education?.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold tracking-wide text-gray-700">EDUCATION</h2>
          <div className="mt-1 space-y-1 text-sm">
            {resume.education.map((ed) => (
              <div key={ed.id}>
                <div className="flex justify-between font-medium">
                  <span>{ed.degree} • {ed.institution}</span>
                  <span className="text-gray-500">{ed.startDate} - {ed.current ? "Present" : ed.endDate}</span>
                </div>
                <div className="text-xs text-gray-700">{ed.location}</div>
              </div>
            ))}
          </div>
        </section>
      )}
      {resume.skills?.length > 0 && (
        <section>
          <h2 className="font-semibold tracking-wide text-gray-700">SKILLS</h2>
          <div className="mt-1 flex flex-wrap gap-2">
            {resume.skills.map((s) => (
              <span key={s.id} className="text-xs bg-gray-100 px-2 py-1 rounded border">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
