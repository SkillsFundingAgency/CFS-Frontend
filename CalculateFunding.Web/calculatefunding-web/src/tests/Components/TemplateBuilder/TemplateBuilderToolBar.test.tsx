import React from "react";
import { mount } from "enzyme";
import { TemplateBuilderToolBar } from "../../../components/TemplateBuilder/TemplateBuilderToolBar";

describe('<TemplateBuilderToolBar />', () => {
    let setChartScaleMock;
    let setTargetScaleMock;

    beforeEach(() => {
        setChartScaleMock = jest.fn();
        setTargetScaleMock = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
      });

    it("renders all buttons", async () => {
        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={1}
            setTargetScale={setTargetScaleMock}
            targetScale={1}
            orgChart={React.createRef()} />);

        expect(wrapper.find("[data-testid='zoomIn']")).toHaveLength(1);
        expect(wrapper.find("[data-testid='zoomOut']")).toHaveLength(1);
        expect(wrapper.find("[data-testid='fullScreen']")).toHaveLength(1);
        expect(wrapper.find("[data-testid='fitToScreen']")).toHaveLength(1);
    });

    it("handles zoom in correctly (positive scale)", async () => {
        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={1}
            setTargetScale={setTargetScaleMock}
            targetScale={1}
            orgChart={React.createRef()} />);

        wrapper.find("[data-testid='zoomIn']").simulate('click');

        expect(setChartScaleMock).toHaveBeenCalledWith(1.1);
    });

    it("handles zoom in correctly (negative scale)", async () => {
        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={-1}
            setTargetScale={setTargetScaleMock}
            targetScale={1}
            orgChart={React.createRef()} />);

        wrapper.find("[data-testid='zoomIn']").simulate('click');

        expect(setChartScaleMock).toHaveBeenCalledWith(1.1);
    });

    it("handles zoom out correctly (positive scale)", async () => {
        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={1}
            setTargetScale={setTargetScaleMock}
            targetScale={1}
            orgChart={React.createRef()} />);

        wrapper.find("[data-testid='zoomOut']").simulate('click');

        expect(setChartScaleMock).toHaveBeenCalledWith(-1.1);
    });

    it("handles zoom out correctly (negative scale)", async () => {
        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={-1}
            setTargetScale={setTargetScaleMock}
            targetScale={1}
            orgChart={React.createRef()} />);

        wrapper.find("[data-testid='zoomOut']").simulate('click');

        expect(setChartScaleMock).toHaveBeenCalledWith(-1.1);
    });

    it("handles fit to screen", async () => {
        const orgChartRef = { current: { clientWidth: 1000 } };

        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={-1}
            setTargetScale={setTargetScaleMock}
            targetScale={0.5}
            orgChart={orgChartRef as React.RefObject<HTMLDivElement>} />);

        wrapper.find("[data-testid='fitToScreen']").simulate('click');

        expect(setTargetScaleMock).toHaveBeenCalledWith(1);
    });

    it("handles fit to screen where scale hasn't changed", async () => {
        const orgChartRef = { current: { clientWidth: 1000 } };

        const wrapper = mount(<TemplateBuilderToolBar
            containerClassName="myChart"
            setChartScale={setChartScaleMock}
            chartScale={-1}
            setTargetScale={setTargetScaleMock}
            targetScale={1}
            orgChart={orgChartRef as React.RefObject<HTMLDivElement>} />);

        wrapper.find("[data-testid='fitToScreen']").simulate('click');

        expect(setTargetScaleMock).toHaveBeenCalledWith(1.0001);
    });
});