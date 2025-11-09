import React from "react";
import type { Resume } from "@/lib/types";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
// @ts-ignore - newly added templates may lack declaration files
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
// @ts-ignore
import OrderedTemplate from "./templates/OrderedTemplate";

export default function ResumePreview({ resume }: { resume: Resume }) {
  const template = resume.template || "classic";
  return (
    <div className="w-full">
      {template === "classic" && <ClassicTemplate resume={resume} />}
      {template === "modern" && <ModernTemplate resume={resume} />}
      {template === "compact" && <ClassicTemplate resume={resume} />}
      {template === "professional" && <ProfessionalTemplate resume={resume} />}
      {template === "ordered" && <OrderedTemplate resume={resume} />}
    </div>
  );
}
