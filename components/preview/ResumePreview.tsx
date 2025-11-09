import React from "react";
import type { Resume } from "@/lib/types";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
// @ts-ignore - new templates no type declarations
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
// @ts-ignore
import OrderedTemplate from "./templates/OrderedTemplate";
// @ts-ignore
import ElegantTemplate from "./templates/ElegantTemplate";

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
    </div>
  );
}
