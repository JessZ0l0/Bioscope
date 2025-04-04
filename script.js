//url for example
const url = "https://clinicaltrials.gov/api/v2/studies?query.term=cholangiocarcinoma&pageSize=200";
console.log("Script loaded!");


let chartInstance = null; // Store the Chart.js instance so we can destroy it later

//fetch the clinical trials api to parse through the data
fetch(url)
    .then(response => {
        console.log("Fetching data from API...");
        return response.json();
    })
    .then(data => {
        const trials = data.studies;
        const ongoingTrials = trials.filter(trial => {
            const status = trial?.protocolSection?.statusModule?.overallStatus.toLowerCase();
            return status === "recruiting" || status === "not yet recruiting" || status === "active, not recruiting";
        });

        const container = document.getElementById("trialContainer");

        ongoingTrials.forEach((trial, index) => {
            const title = trial?.protocolSection?.identificationModule?.briefTitle || "No title";
            const status = trial?.protocolSection?.statusModule?.overallStatus || "Unknown";
            const phase = trial?.protocolSection?.designModule?.phases?.join(", ") || "N/A";

            const trialDiv = document.createElement("div");
            trialDiv.classList.add("trialDiv");

            const expandArea = document.createElement("div");
            expandArea.classList.add("expandArea");

            const titleEl = document.createElement("h3");
            titleEl.textContent = title;

            const statusEl = document.createElement("p");
            statusEl.innerHTML = `<strong>Status:</strong> ${status}`;

            const phaseEl = document.createElement("p");
            phaseEl.innerHTML = `<strong>Phase:</strong> ${phase}`;

            const learnMore = document.createElement("button");
            learnMore.textContent = "Explain this trial";
            learnMore.classList.add("learnMore");

            trialDiv.appendChild(titleEl);
            trialDiv.appendChild(statusEl);
            trialDiv.appendChild(phaseEl);
            trialDiv.appendChild(learnMore);
            trialDiv.appendChild(expandArea);
            container.appendChild(trialDiv);

            if (status.toLowerCase() === "recruiting") {
                const badge = document.createElement("span");
                badge.textContent = "Recruiting";
                badge.classList.add("recruiting-badge");
                statusEl.appendChild(badge);
            }

            learnMore.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".expandArea").forEach(area => area.innerHTML = "");

                const fullTitle = trial?.protocolSection?.identificationModule?.officialTitle || title;
                const description = trial?.protocolSection?.descriptionModule?.briefSummary || "No summary available.";
                const location = trial?.protocolSection?.contactsLocationsModule?.locationList?.[0]?.facility?.name || "Location info not available";
                const startDate = trial?.protocolSection?.statusModule?.startDateStruct?.date || "N/A";
                const primaryCompletion = trial?.protocolSection?.statusModule?.primaryCompletionDateStruct?.date || "N/A";
                const nctId = trial?.protocolSection?.identificationModule?.nctId || "N/A";
                const fullLink = `https://clinicaltrials.gov/study/${nctId}`;

                expandArea.innerHTML = `
                    <div class="expandedContent">
                        <h2>${fullTitle}</h2>
                        <p><strong>NCT ID:</strong> ${nctId}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        <p><strong>Phase:</strong> ${phase}</p>
                        <p><strong>Location:</strong> ${location}</p>
                        <p><strong>Start Date:</strong> ${startDate}</p>
                        <p><strong>Primary Completion:</strong> ${primaryCompletion}</p>
                        <p><strong>Summary:</strong><br>${description}</p>
                        <p><a href="${fullLink}" target="_blank">View on ClinicalTrials.gov</a></p>
                    </div>
                `;

                // Generate Graph
                // const ctx = document.getElementById('trialChart').getContext('2d');
                // if (chartInstance) chartInstance.destroy();

                // let durationInDays = 1;
                // try {
                //     const start = new Date(startDate);
                //     const end = new Date(primaryCompletion);
                //     if (!isNaN(start) && !isNaN(end)) {
                //         durationInDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
                //         if (durationInDays < 0) durationInDays = 1;
                //     }
                // } catch (err) {
                //     console.warn("Could not parse dates", startDate, primaryCompletion);
                // }

                // chartInstance = new Chart(ctx, {
                //     type: 'bar',
                //     data: {
                //         labels: ['Duration (Days)'],
                //         datasets: [{
                //             label: 'Trial Duration',
                //             data: [durationInDays],
                //             backgroundColor: '#007bff'
                //         }]
                //     },
                //     options: {
                //         responsive: true,
                //         plugins: {
                //             title: {
                //                 display: true,
                //                 text: `Trial Duration: ${startDate} → ${primaryCompletion} (${durationInDays} days)`
                //             }
                //         },
                //         scales: {
                //             y: {
                //                 beginAtZero: true
                //             }
                //         }
                //     }

                // Chart.js horizontal bar chart (timeline)
                // const ctx = document.getElementById('trialChart').getContext('2d');
                // if (window.timelineChart) window.timelineChart.destroy(); // destroy previous chart

                // const startDateObj = new Date(startDate);
                // const primaryDateObj = new Date(primaryCompletion);
                // const completionDate = trial?.protocolSection?.statusModule?.completionDateStruct?.date || null;
                // const completionDateObj = completionDate ? new Date(completionDate) : null;

                // // Convert dates to timestamp for durations
                // const baseTime = startDateObj.getTime();
                // const milestones = [
                // { label: "Primary Completion", time: primaryDateObj.getTime() },
                // ];

                // if (completionDateObj) {
                // milestones.push({ label: "Full Completion", time: completionDateObj.getTime() });
                // }

                // window.timelineChart = new Chart(ctx, {
                // type: "bar",
                // data: {
                //     labels: milestones.map(m => m.label),
                //     datasets: [
                //     {
                //         label: "Duration since Start",
                //         data: milestones.map(m => (m.time - baseTime) / (1000 * 60 * 60 * 24)), // in days
                //         backgroundColor: "#007bff"
                //     }
                //     ]
                // },
                // options: {
                //     indexAxis: "y",
                //     responsive: true,
                //     plugins: {
                //     title: {
                //         display: true,
                //         text: `Trial Timeline: ${startDate} → ${primaryCompletion}${completionDate ? " → " + completionDate : ""}`
                //     },
                //     tooltip: {
                //         callbacks: {
                //         label: function (ctx) {
                //             return `+${Math.round(ctx.raw)} days from start`;
                //         }
                //         }
                //     }
                //     },
                //     scales: {
                //     x: {
                //         title: {
                //         display: true,
                //         text: "Days Since Start"
                //         },
                //         beginAtZero: true
                //     }
                //     }
                // }
                // Get dates and convert to timestamps
                const startDateObj = new Date(startDate);
                const primaryObj = new Date(primaryCompletion);
                const completionObj = trial?.protocolSection?.statusModule?.completionDateStruct?.date
                ? new Date(trial.protocolSection.statusModule.completionDateStruct.date)
                : null;

                const minDate = startDateObj.getTime();
                const maxDate = completionObj ? completionObj.getTime() : primaryObj.getTime();

                // Helper to position markers
                function getPercent(dateObj) {
                return ((dateObj.getTime() - minDate) / (maxDate - minDate)) * 100;
                }
                
                // Timeline in visual panel
                const visualContainer = document.getElementById("timelineVisual");
                visualContainer.innerHTML = ""; // Clear previous

                visualContainer.innerHTML = `
                <div class="timeline">
                    <div class="timeline-marker" style="left: ${getPercent(startDateObj)}%; background: green;" title="Start" data-tooltip="🟢 Start: When the trial began."></div>
                    <div class="timeline-marker" style="left: ${getPercent(primaryObj)}%;" title="Primary Completion" data-tooltip="🔵 Primary Completion: The date when the trial collects enough data to answer its main research question. It is often when results start getting analyzed."></div>
                    ${
                        completionObj
                        ? `<div class="timeline-marker" style="left: ${getPercent(completionObj)}%; background: #888;" title="Full Completion" data-tooltip="⚫ Full Completion: When the entire trial ends."></div>`
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
                            month: "short"
                            })}</span>`
                        : ""
                    }
                </div>
                <!-- LEGEND -->
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

                });
            });
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    });

// Global click-away to collapse open trials
document.addEventListener("click", (event) => {
    const clickedInsideExpand = event.target.closest(".expandArea");
    const clickedButton = event.target.closest(".learnMore");
    if (!clickedInsideExpand && !clickedButton) {
        document.querySelectorAll(".expandArea").forEach(area => area.innerHTML = "");
    }
});


// Tooltip setup
const tooltip = document.createElement("div");
tooltip.classList.add("tooltip-box");
document.body.appendChild(tooltip);

document.addEventListener("mouseover", (e) => {
  const marker = e.target.closest(".timeline-marker");
  if (marker && marker.dataset.tooltip) {
    tooltip.textContent = marker.dataset.tooltip;
    tooltip.style.opacity = "1";
  }
});

document.addEventListener("mousemove", (e) => {
  if (tooltip.style.opacity === "1") {
    const tooltipWidth = tooltip.offsetWidth;
    let left = e.pageX + 10;

    // Prevent overflow on the right
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${e.pageY - 30}px`;
  }
});

document.addEventListener("mouseout", (e) => {
  const marker = e.target.closest(".timeline-marker");
  if (marker) {
    tooltip.style.opacity = "0";
  }
});

      