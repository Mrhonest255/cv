"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Plus, Trash2, Download, Save } from "lucide-react";
import { generateResumePDF, downloadPDF } from "@/lib/pdf";
import { generateResumeDOCX, downloadDOCX } from "@/lib/docx";
import { generateFilename } from "@/lib/utils";
import type { Experience, Education, Skill, Certification, Language } from "@/lib/types";

export default function ResumePage() {
  const { currentResume, setCurrentResume, saveCurrentResume, createNewResume, loadAllResumes } = useAppStore();
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAllResumes();
    if (!currentResume) {
      createNewResume();
    }
  }, []);

  // Autosave every 5 seconds after changes
  useEffect(() => {
    if (currentResume && autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      if (currentResume) {
        saveCurrentResume();
      }
    }, 5000);
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentResume]);

  if (!currentResume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Inapakia...</p>
      </div>
    );
  }

  const handlePersonalInfoChange = (field: string, value: string) => {
    setCurrentResume({
      ...currentResume,
      personalInfo: { ...currentResume.personalInfo, [field]: value },
    });
  };

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
    };
    setCurrentResume({
      ...currentResume,
      experience: [...currentResume.experience, newExp],
    });
  };

  const handleRemoveExperience = (id: string) => {
    setCurrentResume({
      ...currentResume,
      experience: currentResume.experience.filter((exp: Experience) => exp.id !== id),
    });
  };

  const handleExperienceChange = (id: string, field: string, value: any) => {
    setCurrentResume({
      ...currentResume,
      experience: currentResume.experience.map((exp: Experience) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
    };
    setCurrentResume({
      ...currentResume,
      education: [...currentResume.education, newEdu],
    });
  };

  const handleRemoveEducation = (id: string) => {
    setCurrentResume({
      ...currentResume,
      education: currentResume.education.filter((edu: Education) => edu.id !== id),
    });
  };

  const handleEducationChange = (id: string, field: string, value: any) => {
    setCurrentResume({
      ...currentResume,
      education: currentResume.education.map((edu: Education) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: 3,
      category: "General",
    };
    setCurrentResume({
      ...currentResume,
      skills: [...currentResume.skills, newSkill],
    });
  };

  // Certifications
  const handleAddCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: "",
      issuer: "",
      date: "",
      expiryDate: "",
      url: "",
    };
    setCurrentResume({
      ...currentResume,
      certifications: [...currentResume.certifications, newCert],
    });
  };
  const handleCertChange = (id: string, field: string, value: any) => {
    setCurrentResume({
      ...currentResume,
      certifications: currentResume.certifications.map((c: Certification) => c.id === id ? { ...c, [field]: value } : c),
    });
  };
  const handleRemoveCert = (id: string) => {
    setCurrentResume({
      ...currentResume,
      certifications: currentResume.certifications.filter((c: Certification) => c.id !== id),
    });
  };

  // Languages
  const handleAddLanguage = () => {
    const newLang: Language = { id: Date.now().toString(), name: "", proficiency: "" };
    setCurrentResume({ ...currentResume, languages: [...currentResume.languages, newLang] });
  };
  const handleLangChange = (id: string, field: string, value: any) => {
    setCurrentResume({
      ...currentResume,
      languages: currentResume.languages.map((l: Language) => l.id === id ? { ...l, [field]: value } : l),
    });
  };
  const handleRemoveLanguage = (id: string) => {
    setCurrentResume({
      ...currentResume,
      languages: currentResume.languages.filter((l: Language) => l.id !== id),
    });
  };

  const handleRemoveSkill = (id: string) => {
    setCurrentResume({
      ...currentResume,
      skills: currentResume.skills.filter((skill: Skill) => skill.id !== id),
    });
  };

  const handleSkillChange = (id: string, field: string, value: any) => {
    setCurrentResume({
      ...currentResume,
      skills: currentResume.skills.map((skill: Skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    });
  };

  const handleExportPDF = async () => {
    try {
      const blob = await generateResumePDF(currentResume, "1-column", false);
      const filename = generateFilename("resume", currentResume.personalInfo.fullName, "pdf");
      downloadPDF(blob, filename);
      toast({ title: "Imefanikiwa!", description: "CV imepakiwa kwa PDF" });
    } catch (error) {
      toast({ title: "Kosa", description: "Imeshindwa kupakua PDF", variant: "destructive" });
    }
  };

  const handleExportDOCX = async () => {
    try {
      const blob = await generateResumeDOCX(currentResume);
      const filename = generateFilename("resume", currentResume.personalInfo.fullName, "docx");
      downloadDOCX(blob, filename);
      toast({ title: "Imefanikiwa!", description: "CV imepakiwa kwa DOCX" });
    } catch (error) {
      toast({ title: "Kosa", description: "Imeshindwa kupakua DOCX", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    await saveCurrentResume();
    toast({ title: "Imehifadhiwa!", description: "CV yako imehifadhiwa kikamilifu" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tengeneza CV Yako</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Hifadhi
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleExportDOCX} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            DOCX
          </Button>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Taarifa Binafsi</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Jina Kamili</Label>
            <Input
              value={currentResume.personalInfo.fullName}
              onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
              placeholder="Jina lako kamili"
            />
          </div>
          <div>
            <Label>Barua Pepe</Label>
            <Input
              type="email"
              value={currentResume.personalInfo.email}
              onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label>Simu</Label>
            <Input
              value={currentResume.personalInfo.phone}
              onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
              placeholder="+255 XXX XXX XXX"
            />
          </div>
          <div>
            <Label>Mahali</Label>
            <Input
              value={currentResume.personalInfo.location}
              onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
              placeholder="Dar es Salaam, Tanzania"
            />
          </div>
          <div>
            <Label>LinkedIn (optional)</Label>
            <Input
              value={currentResume.personalInfo.linkedin || ""}
              onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div>
            <Label>Portfolio (optional)</Label>
            <Input
              value={currentResume.personalInfo.portfolio || ""}
              onChange={(e) => handlePersonalInfoChange("portfolio", e.target.value)}
              placeholder="yourwebsite.com"
            />
          </div>
          <div>
            <Label>Date of Birth (optional)</Label>
            <Input
              type="date"
              value={currentResume.personalInfo.dateOfBirth || ""}
              onChange={(e) => handlePersonalInfoChange("dateOfBirth", e.target.value)}
            />
          </div>
          <div>
            <Label>Nationality (optional)</Label>
            <Input
              value={currentResume.personalInfo.nationality || ""}
              onChange={(e) => handlePersonalInfoChange("nationality", e.target.value)}
              placeholder="Tanzanian"
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Muhtasari (Summary)</h2>
        <Textarea
          value={currentResume.summary}
          onChange={(e) => setCurrentResume({ ...currentResume, summary: e.target.value })}
          placeholder="Andika muhtasari mfupi wa kazi yako na ujuzi wako..."
          rows={4}
        />
      </div>

      {/* Experience Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Uzoefu wa Kazi</h2>
          <Button onClick={handleAddExperience} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ongeza Uzoefu
          </Button>
        </div>
  {currentResume.experience.map((exp: Experience, index: number) => (
          <div key={exp.id} className="border-t pt-4 mt-4 first:border-0 first:mt-0 first:pt-0">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-muted-foreground">Uzoefu #{index + 1}</span>
              <Button
                onClick={() => handleRemoveExperience(exp.id)}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Kazi/Cheo</Label>
                <Input
                  value={exp.title}
                  onChange={(e) => handleExperienceChange(exp.id, "title", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label>Kampuni</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                  placeholder="Tech Corp Ltd"
                />
              </div>
              <div>
                <Label>Mahali</Label>
                <Input
                  value={exp.location}
                  onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                  placeholder="Dar es Salaam"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kuanzia</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hadi</Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                    disabled={exp.current}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => handleExperienceChange(exp.id, "current", e.target.checked)}
                />
                Ninafanya kazi hapa sasa
              </label>
            </div>
            <div className="mt-3">
              <Label>Maelezo ya Kazi</Label>
              <Textarea
                value={exp.description.join("\n")}
                onChange={(e) =>
                  handleExperienceChange(exp.id, "description", e.target.value.split("\n"))
                }
                placeholder="• Kazi ya kwanza&#10;• Kazi ya pili&#10;• Kazi ya tatu"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Elimu</h2>
          <Button onClick={handleAddEducation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ongeza Elimu
          </Button>
        </div>
  {currentResume.education.map((edu: Education, index: number) => (
          <div key={edu.id} className="border-t pt-4 mt-4 first:border-0 first:mt-0 first:pt-0">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-muted-foreground">Elimu #{index + 1}</span>
              <Button
                onClick={() => handleRemoveEducation(edu.id)}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Shahada/Cheti</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                  placeholder="Bachelor of Science"
                />
              </div>
              <div>
                <Label>Taasisi</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                  placeholder="University of Dar es Salaam"
                />
              </div>
              <div>
                <Label>Mahali</Label>
                <Input
                  value={edu.location}
                  onChange={(e) => handleEducationChange(edu.id, "location", e.target.value)}
                  placeholder="Dar es Salaam"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kuanzia</Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hadi</Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                    disabled={edu.current}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={edu.current}
                  onChange={(e) => handleEducationChange(edu.id, "current", e.target.checked)}
                />
                Ninasoma hapa sasa
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ujuzi (Skills)</h2>
          <Button onClick={handleAddSkill} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ongeza Ujuzi
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {currentResume.skills.map((skill: Skill) => (
            <div key={skill.id} className="flex items-center gap-2 border rounded p-3">
              <div className="flex-1">
                <Input
                  value={skill.name}
                  onChange={(e) => handleSkillChange(skill.id, "name", e.target.value)}
                  placeholder="Jina la ujuzi"
                  className="mb-2"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Kiwango:</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={skill.level}
                    onChange={(e) =>
                      handleSkillChange(skill.id, "level", parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">{skill.level}/5</span>
                </div>
              </div>
              <Button
                onClick={() => handleRemoveSkill(skill.id)}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Vyeti (Certifications)</h2>
          <Button onClick={handleAddCertification} size="sm">
            Ongeza Cheti
          </Button>
        </div>
        {currentResume.certifications.map((c: Certification) => (
          <div key={c.id} className="grid md:grid-cols-5 gap-3 border-t pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
            <Input
              value={c.name}
              onChange={(e) => handleCertChange(c.id, "name", e.target.value)}
              placeholder="Certificate Name"
              className="md:col-span-1"
            />
            <Input
              value={c.issuer}
              onChange={(e) => handleCertChange(c.id, "issuer", e.target.value)}
              placeholder="Issuer"
              className="md:col-span-1"
            />
            <Input
              type="date"
              value={c.date}
              onChange={(e) => handleCertChange(c.id, "date", e.target.value)}
              className="md:col-span-1"
            />
            <Input
              type="date"
              value={c.expiryDate || ""}
              onChange={(e) => handleCertChange(c.id, "expiryDate", e.target.value)}
              placeholder="Expiry (optional)"
              className="md:col-span-1"
            />
            <div className="flex gap-2 md:col-span-1">
              <Input
                value={c.url || ""}
                onChange={(e) => handleCertChange(c.id, "url", e.target.value)}
                placeholder="URL (optional)"
              />
              <Button variant="ghost" size="sm" onClick={() => handleRemoveCert(c.id)}>✕</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lugha (Languages)</h2>
          <Button onClick={handleAddLanguage} size="sm">Ongeza Lugha</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {currentResume.languages.map((l: Language) => (
            <div key={l.id} className="flex items-center gap-2 border rounded p-3">
              <Input
                value={l.name}
                onChange={(e) => handleLangChange(l.id, "name", e.target.value)}
                placeholder="Language"
                className="flex-1"
              />
              <Input
                value={l.proficiency}
                onChange={(e) => handleLangChange(l.id, "proficiency", e.target.value)}
                placeholder="Proficiency (Fluent)"
                className="flex-1"
              />
              <Button variant="ghost" size="sm" onClick={() => handleRemoveLanguage(l.id)}>✕</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Maslahi (Interests)</h2>
        <Textarea
          value={currentResume.interests.join("\n")}
          onChange={(e) => setCurrentResume({
            ...currentResume,
            interests: e.target.value.split("\n").filter(Boolean)
          })}
          placeholder={"Volunteering\nTechnology & Innovation\nTravel"}
          rows={4}
        />
      </div>

      {/* References */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Marejeo (References)</h2>
        <Textarea
          value={currentResume.references}
          onChange={(e) => setCurrentResume({ ...currentResume, references: e.target.value })}
          placeholder={"Available upon request OR provide referee details"}
          rows={3}
        />
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={handleSave} size="lg">
          <Save className="h-5 w-5 mr-2" />
          Hifadhi CV
        </Button>
        <Button onClick={handleExportPDF} size="lg" variant="secondary">
          <Download className="h-5 w-5 mr-2" />
          Pakua PDF
        </Button>
      </div>
    </div>
  );
}
