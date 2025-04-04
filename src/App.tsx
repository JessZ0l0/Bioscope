import { useEffect, useState } from "react";
import TrialCard from "./components/TrialCard";
import "./index.css";

type Trial = {
  id: string;
  title: string;
  officialTitle: string;
  status: string;
  phase: string;
  location: string;
  startDate: string;
  primaryCompletion: string;
  completionDate?: string;
  nctId: string;
  description: string;
};

function App() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [cancerType, setCancerType] = useState("cholangiocarcinoma");

  useEffect(() => {
    const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(
      cancerType
    )}&pageSize=200`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const studies = data?.studies || [];
        const parsed = studies.map((study: any, index: number): Trial => {
          const ps = study.protocolSection;
          return {
            id: study.nctId || index.toString(),
            title: ps?.identificationModule?.briefTitle || "No title",
            officialTitle: ps?.identificationModule?.officialTitle || "No official title",
            description: ps?.descriptionModule?.briefSummary || "No summary available.",
            status: ps?.statusModule?.overallStatus || "Unknown",
            phase: ps?.designModule?.phases?.join(", ") || "N/A",
            location: ps?.contactsLocationsModule?.locationList?.[0]?.facility?.name || "Location info not available",
            startDate: ps?.statusModule?.startDateStruct?.date || "N/A",
            primaryCompletion: ps?.statusModule?.primaryCompletionDateStruct?.date || "N/A",
            completionDate: ps?.statusModule?.completionDateStruct?.date || "",
            nctId: ps?.identificationModule?.nctId || "N/A"
          };
        });

        const ongoing = parsed.filter((trial: Trial) => {
          const status = trial.status.toLowerCase();
          return (
            status === "recruiting" ||
            status === "not yet recruiting" ||
            status === "active, not recruiting"
          );
        });

        setTrials(ongoing);
      })
      .catch((err) => console.error("Failed to fetch trials:", err));
  }, [cancerType]);

  useEffect(() => {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip-box");
    document.body.appendChild(tooltip);
  
    const handleMouseOver = (e: MouseEvent) => {
      const marker = (e.target as HTMLElement)?.closest(".timeline-marker") as HTMLElement;
      if (marker && marker.dataset.tooltip) {
        tooltip.textContent = marker.dataset.tooltip;
        tooltip.style.opacity = "1";
      }
    };
  
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltip.style.opacity === "1") {
        const tooltipWidth = tooltip.offsetWidth;
        let left = e.pageX + 10;
        if (left + tooltipWidth > window.innerWidth - 10) {
          left = window.innerWidth - tooltipWidth - 10;
        }
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${e.pageY - 30}px`;
      }
    };
  
    const handleMouseOut = (e: MouseEvent) => {
      const marker = (e.target as HTMLElement)?.closest(".timeline-marker");
      if (marker) {
        tooltip.style.opacity = "0";
      }
    };
  
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
  
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      tooltip.remove();
    };
  }, []);
  

  return (
    <div className="layout">
      <div className="trial-column">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem("search") as HTMLInputElement;
            setCancerType(input.value);
          }}
          style={{ marginBottom: "20px" }}
        >
          <input name="search" type="text" placeholder="Enter cancer type" />
          <button type="submit">Search</button>
        </form>

        {trials.map((trial: Trial) => (
          <TrialCard key={trial.id} {...trial} />
        ))}
      </div>

      <div className="visual-column">
        <h3>Trial Stats</h3>
        <div id="timelineVisual" className="timeline-visual"></div>
      </div>
    </div>
  );
}

export default App;
