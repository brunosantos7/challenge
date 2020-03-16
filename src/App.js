import React, { useState } from "react";
import SummaryResults from "./SummaryResults";
import UnfundedCommitments from "./UnfundedCommitments";
import "./style.css";

function App() {
  const [ceclValue, setCeclValue] = useState(0);
  const [isSummary, setIsSummary] = useState(true);

  const formatAsPercentage = value => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatAsDolarNumber = (value, smallDigits) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: smallDigits !== undefined ? smallDigits : 2
    });

    return `${formatter.format(value)}`;
  };

  return (
    <div>
      <div className="buttonsContainer">
        <button
          className={isSummary ? "active" : "inactive"}
          onClick={e => setIsSummary(true)}
        >
          Summary
        </button>
        <button
          className={!isSummary ? "active" : "inactive"}
          onClick={e => setIsSummary(false)}
        >
          Unfunded
        </button>
      </div>
      <div className="container">
        <SummaryResults
          showSummary={isSummary}
          formatAsPercentageCb={formatAsPercentage}
          formatAsDolarNumberCb={formatAsDolarNumber}
          ceclValue={ceclValue}
        />

        <UnfundedCommitments
          showUnfunded={!isSummary}
          ceclValue={ceclValue}
          setCeclValueCb={setCeclValue}
          formatAsPercentageCb={formatAsPercentage}
          formatAsDolarNumberCb={formatAsDolarNumber}
        />
      </div>
    </div>
  );
}

export default App;
