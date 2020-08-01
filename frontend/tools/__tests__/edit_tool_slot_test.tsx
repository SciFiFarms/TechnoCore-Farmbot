jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

const mockDevice = { moveAbsolute: jest.fn(() => Promise.resolve()) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

let mockPath = "/app/designer/tool-slots/1";
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

jest.mock("../../farm_designer/map/layers/tool_slots/tool_graphics", () => ({
  setToolHover: jest.fn(),
  ToolSlotSVG: () => <div />,
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawEditToolSlot as EditToolSlot } from "../edit_tool_slot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeToolSlot, fakeTool,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { destroy, edit, save } from "../../api/crud";
import { mapStateToPropsEdit } from "../state_to_props";
import { SlotEditRows } from "../tool_slot_edit_components";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { EditToolSlotProps } from "../interfaces";
import { push } from "../../history";
import {
  setToolHover,
} from "../../farm_designer/map/layers/tool_slots/tool_graphics";

describe("<EditToolSlot />", () => {
  const fakeProps = (): EditToolSlotProps => ({
    findToolSlot: jest.fn(),
    tools: [],
    findTool: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    dispatch: jest.fn(),
    firmwareHardware: undefined,
    toolTransformProps: fakeToolTransformProps(),
    isActive: jest.fn(),
  });

  it("redirects", () => {
    mockPath = "/app/designer/tool-slots/nope";
    const wrapper = mount(<EditToolSlot {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(push).toHaveBeenCalledWith("/app/designer/tools");
  });

  it("doesn't redirect", () => {
    mockPath = "/app/logs";
    const wrapper = mount(<EditToolSlot {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(push).not.toHaveBeenCalled();
  });

  it("renders", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    toolSlot.body.meta = { meta_key: "meta value" };
    p.findToolSlot = () => toolSlot;
    const wrapper = mount(<EditToolSlot {...p} />);
    ["edit slot", "x (mm)", "y (mm)", "z (mm)", "tool or seed container",
      "direction", "gantry-mounted", "meta value",
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("unhovers tool slot on unmount", () => {
    const wrapper = mount(<EditToolSlot {...fakeProps()} />);
    wrapper.unmount();
    expect(setToolHover).toHaveBeenCalledWith(undefined);
  });

  it("updates tool slot", () => {
    const slot = fakeToolSlot();
    const wrapper = mount<EditToolSlot>(<EditToolSlot {...fakeProps()} />);
    wrapper.instance().updateSlot(slot)({ x: 123 });
    expect(edit).toHaveBeenCalledWith(slot, { x: 123 });
    expect(save).toHaveBeenCalledWith(slot.uuid);
  });

  it("moves to tool slot", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    toolSlot.body.x = 1;
    toolSlot.body.y = 2;
    toolSlot.body.z = 3;
    p.findToolSlot = () => toolSlot;
    const wrapper = shallow(<EditToolSlot {...p} />);
    wrapper.find(".gray").last().simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("moves to gantry-mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: 10, y: 20, z: 30 };
    const toolSlot = fakeToolSlot();
    toolSlot.body.gantry_mounted = true;
    toolSlot.body.x = 1;
    toolSlot.body.y = 2;
    toolSlot.body.z = 3;
    p.findToolSlot = () => toolSlot;
    const wrapper = shallow(<EditToolSlot {...p} />);
    wrapper.find(".gray").last().simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 10, y: 2, z: 3 });
  });

  it("falls back to tool slot when moving to gantry-mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    const toolSlot = fakeToolSlot();
    toolSlot.body.gantry_mounted = true;
    toolSlot.body.x = 1;
    toolSlot.body.y = 2;
    toolSlot.body.z = 3;
    p.findToolSlot = () => toolSlot;
    const wrapper = shallow(<EditToolSlot {...p} />);
    wrapper.find(".gray").last().simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("removes tool slot", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    p.findToolSlot = () => toolSlot;
    const wrapper = shallow(<EditToolSlot {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(destroy).toHaveBeenCalledWith(toolSlot.uuid);
  });

  it("finds tool", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    p.findToolSlot = () => toolSlot;
    const tool = fakeTool();
    p.findTool = () => tool;
    const wrapper = mount(<EditToolSlot {...p} />);
    expect(wrapper.find(SlotEditRows).props().tool).toEqual(tool);
  });
});

describe("mapStateToPropsEdit()", () => {
  it("returns props", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    const state = fakeState();
    state.resources = buildResourceIndex([tool, toolSlot]);
    const props = mapStateToPropsEdit(state);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot("1")).toEqual(toolSlot);
  });

  it("doesn't find tool slot", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const props = mapStateToPropsEdit(state);
    expect(props.findToolSlot("1")).toEqual(undefined);
  });
});
