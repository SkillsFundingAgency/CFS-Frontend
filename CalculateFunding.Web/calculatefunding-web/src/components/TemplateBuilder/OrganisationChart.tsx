import React, {
    useState,
    useRef,
    forwardRef,
    useEffect,
} from "react";
import {clearSelectedNodeInfo, sendSelectedNodeInfo} from "../../services/templateBuilderService";
import OrganisationChartNode from "./OrganisationChartNode";
import "../../styles/OrganisationChart.scss";
import {
    FundingLineOrCalculation,
    FundingLineDictionaryEntry,
    FundingLine,
    Calculation,
    FundingLineOrCalculationSelectedItem
} from "../../types/TemplateBuilderDefinitions";

interface OrganisationChartProps {
    datasource: Array<FundingLineDictionaryEntry>,
    pan: boolean,
    zoom: boolean,
    zoomOutLimit?: number,
    zoomInLimit?: number,
    containerClass?: string,
    chartClass?: string,
    NodeTemplate: React.ReactType,
    draggable: boolean,
    collapsible: boolean,
    multipleSelect: boolean,
    isEditMode: boolean,
    onClickNode: (node: FundingLineOrCalculationSelectedItem) => void,
    onClickChart?: () => void,
    onClickAdd: (id: string, newChild: FundingLine | Calculation) => Promise<void>,
    changeHierarchy: (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => Promise<void>,
    cloneNode: (draggedItemData: FundingLineOrCalculation, draggedItemDsKey: number, dropTargetId: string, dropTargetDsKey: number) => Promise<void>,
    openSideBar: (open: boolean) => void,
    nextId: number,
    addNodeToRefs: (id: string, ref: React.MutableRefObject<any>) => void,
    focusNodeId?: string | undefined,
    itemRefs?: React.MutableRefObject<{}> | undefined,
    chartScale?: number,
    targetScale?: number,
};

const defaultProps = {
    pan: false,
    zoom: false,
    zoomOutLimit: 0.05,
    zoomInLimit: 1,
    containerClass: "",
    chartClass: "",
    draggable: false,
    collapsible: true,
    multipleSelect: false,
};

const OrganisationChart = forwardRef<HTMLDivElement, OrganisationChartProps>(
    (
        {
            datasource,
            pan,
            zoom,
            zoomOutLimit,
            zoomInLimit,
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
            isEditMode,
            cloneNode,
            openSideBar,
            nextId,
            addNodeToRefs,
            focusNodeId,
            itemRefs,
            chartScale,
            targetScale,
        }, orgChartRef
    ) => {
        const container = useRef<HTMLDivElement>(null);
        const chart: React.RefObject<HTMLDivElement> = orgChartRef as React.RefObject<HTMLDivElement>;

        const [startX, setStartX] = useState(0);
        const [startY, setStartY] = useState(0);
        const [transform, setTransform] = useState("");
        const [panning, setPanning] = useState(false);
        const [cursor, setCursor] = useState("grab");

        useEffect(() => {
            if (!itemRefs || !itemRefs.current || !focusNodeId || focusNodeId.length === 0) return;
            setTransform("");
            sendSelectedNodeInfo(focusNodeId);
            setTimeout(() => {
                (itemRefs.current as any)[focusNodeId].current.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
            }, 500);
        }, [focusNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

        useEffect(() => {
            if (!chartScale) return;
            const newScale: number = chartScale < 0 ? 0.9 : 1.05;
            updateChartScale(newScale);
        }, [chartScale]); // eslint-disable-line react-hooks/exhaustive-deps

        useEffect(() => {
            if (!targetScale || !zoomOutLimit || !zoomInLimit) return;
            if (targetScale > zoomInLimit) {
                targetScale = zoomInLimit;
            }
            if (targetScale < zoomOutLimit) {
                targetScale = zoomOutLimit;
            }
            let matrix: Array<any> = [];
            if (transform === "") {
                setTransform("matrix(" + targetScale + ", 0, 0, " + targetScale + ", 0, 0)");
            } else {
                matrix = transform.split(",");
                if (transform.indexOf("3d") === -1) {
                    matrix[0] = "matrix(" + targetScale;
                    matrix[3] = targetScale;
                    matrix[4] = 0;
                    matrix[5] = 0;
                    setTransform(matrix.join(","));
                } else {
                    matrix[0] = "matrix3d(" + targetScale;
                    matrix[5] = targetScale;
                    matrix[12] = 0;
                    matrix[13] = 0;
                    setTransform(matrix.join(","));
                }
            }
        }, [targetScale]); // eslint-disable-line react-hooks/exhaustive-deps

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
            setCursor("grab");
        };

        const panHandler = (e: any) => {
            let newX = 0;
            let newY = 0;
            if (!e.targetTouches) {
                // pan on desktop
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
                setCursor("grabbing");
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
                // pan on desktop
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
            if (zoomInLimit && zoomOutLimit) {
                let matrix: Array<any> = [];
                let targetScale = 1;
                if (transform === "") {
                    setTransform("matrix(" + newScale + ", 0, 0, " + newScale + ", 0, 0)");
                } else {
                    matrix = transform.split(",");
                    if (transform.indexOf("3d") === -1) {
                        targetScale = Math.abs(Number.parseFloat(matrix[3]) * newScale);
                        if (targetScale > zoomOutLimit && targetScale < zoomInLimit) {
                            matrix[0] = "matrix(" + targetScale;
                            matrix[3] = targetScale;
                            setTransform(matrix.join(","));
                        }
                    } else {
                        targetScale = Math.abs(Number.parseFloat(matrix[5]) * newScale);
                        if (targetScale > zoomOutLimit && targetScale < zoomInLimit) {
                            matrix[0] = "matrix3d(" + targetScale;
                            matrix[5] = targetScale;
                            setTransform(matrix.join(","));
                        }
                    }
                }
            }
            chart && chart.current && chart.current.scrollIntoView({block: "center", inline: "center"});
        };

        const zoomHandler = (e: {deltaY: number;}) => {
            let newScale = 1 + (e.deltaY > 0 ? -0.1 : 0.05);
            updateChartScale(newScale);
        };

        return (
            <div
                id="org-container"
                ref={container}
                className={"orgchart-container " + containerClass}
                onWheel={zoom ? zoomHandler : undefined}
                onMouseUp={pan && panning ? panEndHandler : undefined}>
                <div>
                    <div
                        ref={chart}
                        className={"orgchart " + chartClass}
                        style={{transform: transform, cursor: cursor}}
                        onClick={clickChartHandler}
                        onMouseDown={pan ? panStartHandler : undefined}
                        onMouseMove={pan && panning ? panHandler : undefined}>
                        {datasource.map(ds =>
                            <div className="chart-cell" key={ds.key}>
                                <ul>
                                    <OrganisationChartNode
                                        datasource={attachRel(ds.value, "00")}
                                        NodeTemplate={NodeTemplate}
                                        draggable={draggable && isEditMode}
                                        collapsible={collapsible}
                                        multipleSelect={multipleSelect && isEditMode}
                                        changeHierarchy={changeHierarchy}
                                        cloneNode={cloneNode}
                                        onClickNode={onClickNode}
                                        addNode={onClickAdd}
                                        isEditMode={isEditMode}
                                        openSideBar={openSideBar}
                                        nextId={nextId}
                                        dsKey={ds.key}
                                        addNodeToRefs={addNodeToRefs} />
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

OrganisationChart.defaultProps = defaultProps;

export default OrganisationChart;
