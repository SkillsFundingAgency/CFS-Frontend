import "../../styles/TemplateBuilderToolBar.scss";

import React from "react";

export interface TemplateBuilderToolBarProps {
  setChartScale: React.Dispatch<React.SetStateAction<number>>;
  chartScale: number;
  orgChart: React.RefObject<HTMLDivElement>;
  setTargetScale: React.Dispatch<React.SetStateAction<number>>;
  targetScale: number;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TemplateBuilderToolBar({
  setChartScale,
  chartScale,
  orgChart,
  setTargetScale,
  targetScale,
  isFullScreen,
  setIsFullScreen,
}: TemplateBuilderToolBarProps) {
  const handleZoomIn = () => {
    setChartScale(chartScale < 0 ? chartScale * -1.1 : chartScale * 1.1);
  };

  const handleZoomOut = () => {
    setChartScale(chartScale < 0 ? chartScale * 1.1 : chartScale * -1.1);
  };

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleFitToScreen = () => {
    if (!orgChart || !orgChart.current) return;
    const target = 1000 / orgChart.current.clientWidth;
    setTargetScale(targetScale === target ? targetScale + 0.0001 : target);
    setTimeout(() => {
      setChartScale(chartScale * 1.001);
    }, 500);
  };

  return (
    <div className="toolbar">
      <div className="tooltip">
        <span className="tooltiptext">Zoom in</span>
        <button className="btn" onClick={handleZoomIn} data-testid="zoomIn">
          <img src="/app/assets/images/plus.png" />
        </button>
      </div>
      <div className="tooltip">
        <span className="tooltiptext">Zoom out</span>
        <button className="btn" onClick={handleZoomOut} data-testid="zoomOut">
          <img src="/app/assets/images/minus.png" />
        </button>
      </div>
      <div className="tooltip">
        <span className="tooltiptext" data-testid="fullScreenTooltip">
          {isFullScreen ? "Exit full screen" : "Full screen"}
        </span>
        <button className="btn" onClick={handleFullScreen} data-testid="fullScreen">
          <img src="/app/assets/images/expand.png" />
        </button>
      </div>
      <div className="tooltip">
        <span className="tooltiptext">Fit to screen</span>
        <button className="btn" onClick={handleFitToScreen} data-testid="fitToScreen">
          <img src="/app/assets/images/switch.png" />
        </button>
      </div>
    </div>
  );
}
