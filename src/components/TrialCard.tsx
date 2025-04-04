import React, { useState, useEffect, useRef } from "react";
import "../index.css";

type TrialCardProps = {
  title: string;
  officialTitle: string;
  description: string;
  status: string;
  phase: string;
  location: string;
  startDate: string;
  primaryCompletion: string;
  completionDate?: string;
  nctId: string;
};

const TrialCard: React.FC<TrialCardProps> = ({
  title,
  officialTitle,
  description,
  status,
  phase,
  location,
  startDate,
  primaryCompletion,
  completionDate,
  nctId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (!expanded) return;

    const visualContainer = document.getElementById("timelineVisual");
    if (!visualContainer) return;

    const startDateObj = new Date(startDate);
    const primaryObj = new Date(primaryCompletion);
    const completionObj = completionDate ? new Date(completionDate) : null;

    const minDate = startDateObj.getTime();
    const maxDate = completionObj ? completionObj.getTime() : primaryObj.getTime();

    const getPercent = (dateObj: Date) => ((dateObj.getTime() - minDate) / (maxDate - minDate)) * 100;

    visualContainer.innerHTML = `
      <div class="timeline">
        <div class="timeline-marker" style="left: ${getPercent(startDateObj)}%; background: green;" data-tooltip="🟢 Start: When the trial began."></div>
        <div class="timeline-marker" style="left: ${getPercent(primaryObj)}%;" data-tooltip="🔵 Primary Completion: The date when the trial collects enough data to answer its main research question."></div>
        ${
          completionObj
            ? `<div class="timeline-marker" style="left: ${getPercent(completionObj)}%; background: #888;" data-tooltip="⚫ Full Completion: When the entire trial ends."></div>`
            : ""
        }
      </div>
      <div class="timeline-labels">
        <span>${startDate}</span>
        <span>${primaryCompletion}</span>
        ${
          completionObj
            ? `<span>${completionObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}</span>`
            : ""
        }
      </div>
      <div class="timeline-legend">
        <div><span class="legend-dot" style="background: green;"></span> Start Date</div>
        <div><span class="legend-dot" style="background: #007bff;"></span> Primary Completion</div>
        ${
          completionObj
            ? `<div><span class="legend-dot" style="background: #888;"></span> Full Completion</div>`
            : ""
        }
      </div>
    `;
  }, [expanded, startDate, primaryCompletion, completionDate]);

  return (
    <div className="trialDiv">
      <h3>{title}</h3>
      <p>
        <strong>Status:</strong> {status}
        {status.toLowerCase() === "recruiting" && (
          <span className="recruiting-badge">Recruiting</span>
        )}
      </p>
      <p>
        <strong>Phase:</strong> {phase}
      </p>
      <button className="learnMore" onClick={handleClick}>
        {expanded ? "Collapse" : "Explain this trial"}
      </button>
      <div className="expandArea" ref={expandRef}>
        {expanded && (
          <div className="expandedContent">
            <h2>{officialTitle}</h2>
            <p><strong>NCT ID:</strong> {nctId}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Phase:</strong> {phase}</p>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Start Date:</strong> {startDate}</p>
            <p><strong>Primary Completion:</strong> {primaryCompletion}</p>
            <p><strong>Summary:</strong><br />{description}</p>
            <p><a href={`https://clinicaltrials.gov/study/${nctId}`} target="_blank">View on ClinicalTrials.gov</a></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialCard;
