import React from "react";
import type { Resume } from "@/lib/types";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
// @ts-ignore - suppress TS resolution issue in editor
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import OrderedTemplate from "./templates/OrderedTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";
import GlassTemplate from "./templates/GlassTemplate";

export default function ResumePreview({ resume }: { resume: Resume }) {
  const template = resume.template || "classic";
  return (
    <div className="w-full">
  {template === "classic" && <ClassicTemplate resume={resume} />}
  {template === "modern" && <ModernTemplate resume={resume} />}
  {template === "compact" && <ClassicTemplate resume={resume} />}
  {template === "professional" && <ProfessionalTemplate resume={resume} />}
  {template === "ordered" && <OrderedTemplate resume={resume} />}
  {template === "elegant" && <ElegantTemplate resume={resume} />}
  {template === "glass" && <GlassTemplate resume={resume} />}
    </div>
  );
}
