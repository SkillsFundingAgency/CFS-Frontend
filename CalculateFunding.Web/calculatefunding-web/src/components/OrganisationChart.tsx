import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";
import { clearSelectedNodeInfo } from "../services/templateBuilderService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OrganisationChartNode from "./OrganisationChartNode";
import "../styles/OrganisationChart.scss";
import { FundingLineOrCalculation, FundingLineDictionaryEntry, FundingLine, Calculation, FundingLineOrCalculationSelectedItem } from "../types/TemplateBuilderDefinitions";

interface OrganisationChartProps {
  datasource: Array<FundingLineDictionaryEntry>,
  pan?: boolean,
  zoom?: boolean,
  zoomoutLimit?: number,
  zoominLimit?: number,
  containerClass?: string,
  chartClass?: string,
  NodeTemplate: React.ReactType,
  draggable?: boolean,
  collapsible?: boolean,
  multipleSelect?: boolean,
  onClickNode: (node: FundingLineOrCalculationSelectedItem) => void,
  onClickChart?: () => void,
  onClickAdd: (id: string, newChild: FundingLine | Calculation) => Promise<void>,
  changeHierarchy: (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => Promise<void>,
  cloneNode: (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => Promise<void>,
  openSideBar: (open: boolean) => void,
  editMode: boolean,
  nextId: number,
};

const defaultProps = {
  pan: false,
  zoom: false,
  zoomoutLimit: 0.1,
  zoominLimit: 1,
  containerClass: "",
  chartClass: "",
  draggable: false,
  collapsible: true,
  multipleSelect: false
};

const OrganisationChart = forwardRef<any, OrganisationChartProps>(
  (
    {
      datasource,
      pan,
      zoom,
      zoomoutLimit,
      zoominLimit,
      containerClass,
      chartClass,
      NodeTemplate,
      draggable,
      collapsible,
      multipleSelect,
      onClickNode,
      onClickChart,
      onClickAdd,
      changeHierarchy,
      cloneNode,
      openSideBar,
      editMode,
      nextId,
    },
    ref
  ) => {
    const container = useRef<HTMLDivElement>(null);
    const chart = useRef<HTMLDivElement>(null);
    const downloadButton = useRef<HTMLAnchorElement>(null);

    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [transform, setTransform] = useState("");
    const [panning, setPanning] = useState(false);
    const [cursor, setCursor] = useState("default");
    const [exporting, setExporting] = useState(false);
    const [dataURL, setDataURL] = useState("");
    const [download, setDownload] = useState("");

    const attachRel = (data: FundingLineOrCalculation, flags: string) => {
      data.relationship =
        flags + (data.children && data.children.length > 0 ? 1 : 0);
      if (data.children) {
        data.children.forEach(function (item: FundingLineOrCalculation) {
          attachRel(item, "1" + (data.children && (data.children.length > 1) ? 1 : 0));
        });
      }
      return data;
    };

    const clickChartHandler = (event: any) => {
      if (!event.target.closest(".oc-node")) {
        if (onClickChart) {
          onClickChart();
        }
        clearSelectedNodeInfo();
      }
    };

    const panEndHandler = () => {
      setPanning(false);
      setCursor("default");
    };

    const panHandler = (e: any) => {
      let newX = 0;
      let newY = 0;
      if (!e.targetTouches) {
        // pand on desktop
        newX = e.pageX - startX;
        newY = e.pageY - startY;
      } else if (e.targetTouches.length === 1) {
        // pan on mobile device
        newX = e.targetTouches[0].pageX - startX;
        newY = e.targetTouches[0].pageY - startY;
      } else if (e.targetTouches.length > 1) {
        return;
      }
      if (transform === "") {
        if (transform.indexOf("3d") === -1) {
          setTransform("matrix(1,0,0,1," + newX + "," + newY + ")");
        } else {
          setTransform(
            "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0," + newX + ", " + newY + ",0,1)"
          );
        }
      } else {
        let matrix = transform.split(",");
        if (transform.indexOf("3d") === -1) {
          matrix[4] = newX.toString();
          matrix[5] = newY + ")";
        } else {
          matrix[12] = newX.toString();
          matrix[13] = newY.toString();
        }
        setTransform(matrix.join(","));
      }
    };

    const panStartHandler = (e: any) => {
      if (e.target.closest(".oc-node")) {
        setPanning(false);
        return;
      } else {
        setPanning(true);
        setCursor("move");
      }
      let lastX = 0;
      let lastY = 0;
      if (transform !== "") {
        let matrix = transform.split(",");
        if (transform.indexOf("3d") === -1) {
          lastX = parseInt(matrix[4]);
          lastY = parseInt(matrix[5]);
        } else {
          lastX = parseInt(matrix[12]);
          lastY = parseInt(matrix[13]);
        }
      }
      if (!e.targetTouches) {
        // pand on desktop
        setStartX(e.pageX - lastX);
        setStartY(e.pageY - lastY);
      } else if (e.targetTouches.length === 1) {
        // pan on mobile device
        setStartX(e.targetTouches[0].pageX - lastX);
        setStartY(e.targetTouches[0].pageY - lastY);
      } else if (e.targetTouches.length > 1) {
        return;
      }
    };

    const updateChartScale = (newScale: number) => {
      if (zoominLimit && zoomoutLimit) {
        let matrix: Array<any> = [];
        let targetScale = 1;
        if (transform === "") {
          setTransform("matrix(" + newScale + ", 0, 0, " + newScale + ", 0, 0)");
        } else {
          matrix = transform.split(",");
          if (transform.indexOf("3d") === -1) {
            targetScale = Math.abs(Number.parseFloat(matrix[3]) * newScale);
            if (targetScale > zoomoutLimit && targetScale < zoominLimit) {
              matrix[0] = "matrix(" + targetScale;
              matrix[3] = targetScale;
              setTransform(matrix.join(","));
            }
          } else {
            targetScale = Math.abs(Number.parseFloat(matrix[5]) * newScale);
            if (targetScale > zoomoutLimit && targetScale < zoominLimit) {
              matrix[0] = "matrix3d(" + targetScale;
              matrix[5] = targetScale;
              setTransform(matrix.join(","));
            }
          }
        }
      }
    };

    const zoomHandler = (e: { deltaY: number; }) => {
      let newScale = 1 + (e.deltaY > 0 ? -0.2 : 0.2);
      updateChartScale(newScale);
    };

    const exportPDF = (canvas: HTMLCanvasElement, exportFilename: string) => {
      const canvasWidth = Math.floor(canvas.width);
      const canvasHeight = Math.floor(canvas.height);
      const doc =
        canvasWidth > canvasHeight
          ? new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvasWidth, canvasHeight]
          })
          : new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvasHeight, canvasWidth]
          });
      doc.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0);
      doc.save(exportFilename + ".pdf");
    };

    const exportPNG = (canvas: HTMLCanvasElement, exportFilename: string) => {
      if (downloadButton && downloadButton.current) {
        const isWebkit = "WebkitAppearance" in document.documentElement.style;
        const isFf = !!(window as any).sidebar;
        const isEdge =
          navigator.appName === "Microsoft Internet Explorer" ||
          (navigator.appName === "Netscape" &&
            navigator.appVersion.indexOf("Edge") > -1);

        if ((!isWebkit && !isFf) || isEdge) {
          window.navigator.msSaveBlob((canvas as any).msToBlob(), exportFilename + ".png");
        } else {
          setDataURL(canvas.toDataURL());
          setDownload(exportFilename + ".png");
          downloadButton.current.click();
        }
      }
    };

    useImperativeHandle(ref, () => ({
      exportTo: (exportFilename: string, exportFileextension: string) => {
        if (container && container.current && chart && chart.current) {
          exportFilename = exportFilename || "OrgChart";
          exportFileextension = exportFileextension || "png";
          setExporting(true);
          const originalScrollLeft = container.current.scrollLeft;
          container.current.scrollLeft = 0;
          const originalScrollTop = container.current.scrollTop;
          container.current.scrollTop = 0;
          html2canvas(chart.current, {
            width: chart.current.clientWidth,
            height: chart.current.clientHeight,
            onclone: function (clonedDoc: any) {
              clonedDoc.querySelector(".orgchart").style.background = "none";
              clonedDoc.querySelector(".orgchart").style.transform = "";
            }
          }).then(
            canvas => {
              if (container && container.current) {
                if (exportFileextension.toLowerCase() === "pdf") {
                  exportPDF(canvas, exportFilename);
                } else {
                  exportPNG(canvas, exportFilename);
                }
                setExporting(false);
                container.current.scrollLeft = originalScrollLeft;
                container.current.scrollTop = originalScrollTop;
              }
            },
            () => {
              if (container && container.current) {
                setExporting(false);
                container.current.scrollLeft = originalScrollLeft;
                container.current.scrollTop = originalScrollTop;
              }
            }
          );
        }
      },
      expandAllNodes: () => {
        if (chart && chart.current) {
          chart.current
            .querySelectorAll(
              ".oc-node.hidden, .oc-hierarchy.hidden, .isSiblingsCollapsed, .isAncestorsCollapsed"
            )
            .forEach((el: { classList: { remove: (arg0: string, arg1: string, arg2: string) => void; }; }) => {
              el.classList.remove(
                "hidden",
                "isSiblingsCollapsed",
                "isAncestorsCollapsed"
              );
            });
        }
      }
    }));

    return (
      <div
        ref={container}
        className={"orgchart-container " + containerClass}
        onWheel={zoom ? zoomHandler : undefined}
        onMouseUp={pan && panning ? panEndHandler : undefined}
      >
        <div
          ref={chart}
          className={"orgchart " + chartClass}
          style={{ transform: transform, cursor: cursor }}
          onClick={clickChartHandler}
          onMouseDown={pan ? panStartHandler : undefined}
          onMouseMove={pan && panning ? panHandler : undefined}
        >
          {datasource.map(ds =>
            <div className="chart-cell" key={ds.key}>
              <ul>
                <OrganisationChartNode
                  datasource={attachRel(ds.value, "00")}
                  NodeTemplate={NodeTemplate}
                  draggable={draggable && editMode}
                  collapsible={collapsible}
                  multipleSelect={multipleSelect && editMode}
                  changeHierarchy={changeHierarchy}
                  cloneNode={cloneNode}
                  onClickNode={onClickNode}
                  addNode={onClickAdd}
                  openSideBar={openSideBar}
                  editMode={editMode}
                  nextId={nextId}
                  dsKey={ds.key}
                />
              </ul>
            </div>
          )}
        </div>
        <a
          className="oc-download-btn hidden"
          ref={downloadButton}
          href={dataURL}
          download={download}
        >
          &nbsp;
          </a>
        <div className={`oc-mask ${exporting ? "" : "hidden"}`}>
          <i className="oci oci-spinner spinner"></i>
        </div>
      </div>
    );
  }
);

OrganisationChart.defaultProps = defaultProps;

export default OrganisationChart;
