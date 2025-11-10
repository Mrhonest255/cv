"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Plus, Trash2, Download, Save, Eye, Loader2, Wand2, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
const ResumePreview = dynamic(() => import("@/components/preview/ResumePreview"), { ssr: false });
import { generateResumePDF, downloadPDF } from "@/lib/pdf";
import { generateResumeDOCX, downloadDOCX } from "@/lib/docx";
import { generateFilename } from "@/lib/utils";
import type { Experience, Education, Skill, Certification, Language, Resume } from "@/lib/types";

export default function ResumePage() {
  const { currentResume, setCurrentResume, saveCurrentResume, createNewResume, loadAllResumes, resumes } = useAppStore();
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [draftTimer, setDraftTimer] = useState<NodeJS.Timeout | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [exporting, setExporting] = useState<{ pdf: boolean; docx: boolean }>({ pdf: false, docx: false });
  const [aiLoading, setAiLoading] = useState<{ summary: boolean }>({ summary: false });
  const DRAFT_KEY_PREFIX = 'resume_draft_';

  useEffect(() => {
    loadAllResumes();
    if (!currentResume) {
      createNewResume();
    }
    const beforeUnload = () => { if (currentResume) saveCurrentResume(); };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  // If resumes exist and no current selected, pick the most recently updated
  useEffect(() => {
    if (!currentResume && Array.isArray(resumes) && resumes.length > 0) {
      const latest = [...resumes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      if (latest) setCurrentResume(latest as Resume);
    }
  }, [resumes]);

  // Autosave every 2 seconds after changes
  useEffect(() => {
    if (currentResume && autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      if (currentResume) {
        saveCurrentResume();
      }
    }, 2000);
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentResume]);

  // Persist a local draft quickly so data survives unexpected refreshes
  useEffect(() => {
    if (!currentResume) return;
    if (draftTimer) clearTimeout(draftTimer);
    const t = setTimeout(() => {
      try {
        const key = `${DRAFT_KEY_PREFIX}${currentResume.id}`;
        localStorage.setItem(key, JSON.stringify(currentResume));
      } catch {}
    }, 500);
    setDraftTimer(t);
    return () => { if (t) clearTimeout(t); };
  }, [currentResume]);

  // On first time we have a current resume, try to restore newer local draft (if any)
  useEffect(() => {
    if (!currentResume) return;
    try {
      const key = `${DRAFT_KEY_PREFIX}${currentResume.id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw) as Resume;
        const draftTime = new Date(draft.updatedAt || 0).getTime();
        const currTime = new Date(currentResume.updatedAt || 0).getTime();
        if (draftTime && (!currTime || draftTime > currTime)) {
          setCurrentResume(draft);
        }
      }
    } catch {}
  // run only when a different resume is set
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResume?.id]);

  if (!currentResume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Inapakia...</p>
      </div>
    );
  }

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        error = "Muundo wa barua pepe si sahihi.";
      }
    }
    if (field === "phone") {
      const phoneRegex = /^\+?[0-9\s-()]{10,}$/;
      if (value && !phoneRegex.test(value)) {
        error = "Nambari ya simu si sahihi.";
      }
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const handlePersonalInfoChange = (field: string, value:string) => {
    validateField(field, value);
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
      setExporting(p=>({...p,pdf:true}));
      const layout = templateToExportLayout(currentResume.template);
      const blob = await generateResumePDF(currentResume, {
        layout,
        template: currentResume.template,
        includeWatermark: false,
      });
      const filename = generateFilename("resume", currentResume.personalInfo.fullName, "pdf");
      downloadPDF(blob, filename);
      toast({ title: "Imefanikiwa!", description: "CV imepakuliwa kama PDF" });
    } catch (error:any) {
      console.error(error);
      toast({ title: "Kosa", description: error.message || "Imeshindwa kupakua PDF", variant: "destructive" });
    } finally { setExporting(p=>({...p,pdf:false})); }
  };

  const handleExportDOCX = async () => {
    try {
      setExporting(p=>({...p,docx:true}));
  const blob = await generateResumeDOCX(currentResume, { template: currentResume.template });
      const filename = generateFilename("resume", currentResume.personalInfo.fullName, "docx");
      downloadDOCX(blob, filename);
      toast({ title: "Imefanikiwa!", description: "CV imepakuliwa kama DOCX" });
    } catch (error:any) {
      console.error(error);
      toast({ title: "Kosa", description: error.message || "Imeshindwa kupakua DOCX", variant: "destructive" });
    } finally { setExporting(p=>({...p,docx:false})); }
  };

  const handleSave = async () => {
    await saveCurrentResume();
    toast({ title: "Imehifadhiwa!", description: "CV yako imehifadhiwa kikamilifu" });
  };

  function templateToExportLayout(t?: Resume['template']): '1-column' | '2-column' {
    if(!t) return '1-column';
    return ['modern','compact','glass'].includes(t) ? '2-column' : '1-column';
  }

  function buildResumeContext(resume: Resume): string {
    const parts:string[]=[];
    const p = resume.personalInfo;
    parts.push(`Jina: ${p.fullName}`);
    if(p.email) parts.push(`Email: ${p.email}`);
    if(p.phone) parts.push(`Simu: ${p.phone}`);
    if(p.location) parts.push(`Mahali: ${p.location}`);
    if(resume.summary) parts.push(`Muhtasari: ${resume.summary}`);
    if(resume.skills.length) parts.push(`Ujuzi: ${resume.skills.map(s=>s.name).join(', ')}`);
    if(resume.experience.length){
      parts.push('Uzoefu:');
      resume.experience.forEach(e=>{
        parts.push(`- ${e.title} @ ${e.company} (${e.startDate} - ${e.current ? 'Sasa' : e.endDate})`);
        e.description.forEach(d=> parts.push(`  • ${d}`));
      });
    }
    return parts.join('\n');
  }

  function moveSection(index:number, delta:number){
    const resume = currentResume;
    if(!resume) return;
    const arr = [...resume.sectionOrder];
    const target = index + delta;
    if(target < 0 || target >= arr.length) return;
    const [item] = arr.splice(index,1);
    arr.splice(target,0,item);
    setCurrentResume({ ...resume, sectionOrder: arr });
  }

  return (
  <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Tengeneza CV Yako</h1>
        {/* Desktop actions */}
        <div className="hidden sm:flex flex-wrap gap-2">
          <Button onClick={handleSave} variant="outline" aria-label="Hifadhi CV">
            <Save className="h-4 w-4 mr-2" />
            Hifadhi
          </Button>
          <Button onClick={handleExportPDF} variant="outline" disabled={exporting.pdf} aria-label="Pakua PDF">
            {exporting.pdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Download className="h-4 w-4 mr-2" />}
            {exporting.pdf ? 'Inatengeneza...' : 'PDF'}
          </Button>
          <Button onClick={handleExportDOCX} variant="outline" disabled={exporting.docx} aria-label="Pakua DOCX">
            {exporting.docx ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Download className="h-4 w-4 mr-2" />}
            {exporting.docx ? 'Inatengeneza...' : 'DOCX'}
          </Button>
        </div>
        {/* Mobile consolidated actions */}
        <div className="sm:hidden">
          <details className="relative">
            <summary className="list-none">
              <Button variant="outline" className="gap-2" aria-haspopup="true" aria-expanded="false">
                <MoreHorizontal className="h-4 w-4" />
                Actions
              </Button>
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg z-20 p-2 flex flex-col gap-2">
              <Button onClick={handleSave} variant="ghost" className="justify-start" aria-label="Hifadhi CV">
                <Save className="h-4 w-4 mr-2" /> Hifadhi
              </Button>
              <Button onClick={handleExportPDF} variant="ghost" disabled={exporting.pdf} className="justify-start" aria-label="Pakua PDF">
                {exporting.pdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Download className="h-4 w-4 mr-2" />}
                {exporting.pdf ? 'Inatengeneza...' : 'Pakua PDF'}
              </Button>
              <Button onClick={handleExportDOCX} variant="ghost" disabled={exporting.docx} className="justify-start" aria-label="Pakua DOCX">
                {exporting.docx ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Download className="h-4 w-4 mr-2" />}
                {exporting.docx ? 'Inatengeneza...' : 'Pakua DOCX'}
              </Button>
            </div>
          </details>
        </div>
      </div>
      {/* Main form + preview grid */}
  <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Form */}
  <div className="lg:col-span-2 space-y-8">

  {/* Personal Info Section */}
      <div className="bg-card border rounded-lg p-6 mb-6 animate-fadeIn">
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
              onBlur={(e) => validateField("email", e.target.value)}
              placeholder="email@example.com"
              className={formErrors.email ? "border-destructive" : ""}
            />
            {formErrors.email && <p className="text-sm text-destructive mt-1">{formErrors.email}</p>}
          </div>
          <div>
            <Label>Simu</Label>
            <Input
              value={currentResume.personalInfo.phone}
              onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
              onBlur={(e) => validateField("phone", e.target.value)}
              placeholder="+255 XXX XXX XXX"
              className={formErrors.phone ? "border-destructive" : ""}
            />
            {formErrors.phone && <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>}
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Muhtasari (Summary)</h2>
          <Button size="sm" variant="outline" disabled={aiLoading.summary} className="gap-2"
            onClick={async ()=>{
              try{
                setAiLoading(s=>({...s,summary:true}));
                const text = buildResumeContext(currentResume);
                const res = await fetch('/api/improve-text',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text, prompt: 'Andika muhtasari wa kitaalamu wenye sentensi 3-4 unaoonyesha mafanikio na ujuzi muhimu wa mwombaji kwa Kiswahili.'})});
                const data = await res.json();
                if(data?.improvedText){ setCurrentResume({...currentResume, summary: data.improvedText.trim()}); toast({title:'Imekamilika', description:'Muhtasari umetengenezwa na AI'}); } else throw new Error('Hakuna majibu ya AI');
              }catch(e:any){ console.error(e); toast({title:'Kosa', description:e.message || 'Imeshindwa kutengeneza muhtasari', variant:'destructive'});} finally { setAiLoading(s=>({...s,summary:false})); }
            }}>
            {aiLoading.summary ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4"/>}
            {aiLoading.summary ? 'Inatengeneza...' : 'AI Muhtasari'}
          </Button>
        </div>
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
              <div className="flex items-center justify-between">
                <Label>Maelezo ya Kazi</Label>
                <Button size="sm" variant="outline" onClick={async ()=>{
                  try{
                    const raw = exp.description.join('\n');
                    const res = await fetch('/api/improve-text',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: raw, prompt: 'Badilisha haya kuwa pointi 4-6 za CV zenye nguvu (vitenzi vya hatua, matokeo yanayopimika) kwa Kiswahili. Rudisha pointi kwa mistari tofauti.'})});
                    const data = await res.json();
                    const bullets = (data?.improvedText||'').split('\n').map((s:string)=>s.replace(/^[-•\s]+/,'').trim()).filter(Boolean);
                    handleExperienceChange(exp.id,'description', bullets);
                    toast({title:'Imekamilika', description:'Bullets zimeboreshwa'});
                  }catch(e:any){ console.error(e); toast({title:'Kosa', description:e.message||'Imeshindwa kuboresha bullets', variant:'destructive'}); }
                }}>Boreshwa na AI</Button>
              </div>
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

          <div className="flex justify-center gap-4 mt-8 flex-wrap">
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
        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Eye className="h-4 w-4"/>Live Preview</h2>
            </div>
            <div className="mb-4">
              <Label>Aina ya Template</Label>
              <select
                value={currentResume.template}
                onChange={(e)=>setCurrentResume({...currentResume, template: e.target.value as Resume['template']})}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="compact">Compact</option>
                <option value="professional">Professional</option>
                <option value="ordered">Ordered</option>
                <option value="elegant">Elegant</option>
                <option value="glass">Glass</option>
              </select>
            </div>
            <div className="mb-4">
              <Label>Mpangilio wa Sehemu</Label>
              <ul className="mt-2 space-y-1">
                {currentResume.sectionOrder.map((sec, i)=> (
                  <li key={sec} className="flex items-center justify-between text-xs border rounded px-2 py-1 bg-muted/30">
                    <span className="capitalize">{sec}</span>
                    <span className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label="Peleka juu" disabled={i===0} onClick={()=>moveSection(i,-1)}><ArrowUp className="h-4 w-4"/></Button>
                      <Button size="icon" variant="ghost" aria-label="Peleka chini" disabled={i===currentResume.sectionOrder.length-1} onClick={()=>moveSection(i,1)}><ArrowDown className="h-4 w-4"/></Button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-[520px] overflow-y-auto custom-scrollbar">
              <ResumePreview resume={currentResume as Resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
