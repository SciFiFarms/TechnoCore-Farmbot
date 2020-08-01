jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import {
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
const mockConfig = fakeWebAppConfig();
jest.mock("../../../resources/selectors", () => ({
  getWebAppConfig: () => mockConfig,
  assertUuid: jest.fn(),
}));

import * as React from "react";
import { ImageFilterMenu, ImageFilterMenuProps } from "../image_filter_menu";
import { shallow, mount } from "enzyme";
import { StringConfigKey } from "farmbot/dist/resources/configs/web_app";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";
import { edit, save } from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<ImageFilterMenu />", () => {
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";

  const fakeProps = (): ImageFilterMenuProps => ({
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
    getConfigValue: jest.fn(x => mockConfig.body[x as StringConfigKey]),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageFilterMenu {...p} />);
    ["Date", "Time", "Newer than", "Older than"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it.each<[
    "beginDate" | "endDate", "photo_filter_begin" | "photo_filter_end", number
  ]>([
    ["beginDate", "photo_filter_begin", 0],
    ["endDate", "photo_filter_end", 2],
  ])("sets filter: %s", (filter, key, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "2001-01-03" }
    });
    expect(wrapper.instance().state[filter]).toEqual("2001-01-03");
    expect(edit).toHaveBeenCalledWith(config, {
      [key]: "2001-01-03T00:00:00.000Z"
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginTime" | "endTime", "photo_filter_begin" | "photo_filter_end", number
  ]>([
    ["beginTime", "photo_filter_begin", 1],
    ["endTime", "photo_filter_end", 3],
  ])("sets filter: %s", (filter, key, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.setState({ beginDate: "2001-01-03", endDate: "2001-01-03" });
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "05:00" }
    });
    expect(wrapper.instance().state[filter]).toEqual("05:00");
    expect(edit).toHaveBeenCalledWith(config, {
      [key]: "2001-01-03T05:00:00.000Z"
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginDate" | "endDate",
    "photo_filter_begin" | "photo_filter_end",
    number
  ]>([
    ["beginDate", "photo_filter_begin", 0],
    ["endDate", "photo_filter_end", 2],
  ])("unsets filter: %s", (filter, key, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.setState({ beginDate: "2001-01-03", endDate: "2001-01-03" });
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "" }
    });
    expect(wrapper.instance().state[filter]).toEqual(undefined);
    // tslint:disable-next-line:no-null-keyword
    expect(edit).toHaveBeenCalledWith(config, { [key]: null });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it.each<[
    "beginTime" | "endTime", number
  ]>([
    ["beginTime", 1],
    ["endTime", 3],
  ])("doesn't set filter: %s", (filter, i) => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.find("BlurableInput").at(i).simulate("commit", {
      currentTarget: { value: "05:00" }
    });
    expect(wrapper.instance().state[filter]).toEqual("05:00");
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("loads values from config", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2001-01-03T06:00:00.000Z";
    const wrapper = shallow(<ImageFilterMenu {...fakeProps()} />);
    expect(wrapper.state()).toEqual({
      beginDate: "2001-01-03", beginTime: "05:00",
      endDate: "2001-01-03", endTime: "06:00", slider: NaN
    });
  });

  it("changes slider", () => {
    const p = fakeProps();
    const state = fakeState();
    const config = fakeWebAppConfig();
    state.resources = buildResourceIndex([config]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    p.getConfigValue = () => undefined;
    p.imageAgeInfo.newestDate = "2001-01-03T05:00:00.000Z";
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().sliderChange(1);
    expect(wrapper.instance().state.slider).toEqual(1);
    expect(edit).toHaveBeenCalledWith(config, {
      photo_filter_begin: "2001-01-02T00:00:00.000Z",
      photo_filter_end: "2001-01-03T00:00:00.000Z",
    });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("doesn't update config", () => {
    const p = fakeProps();
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    p.getConfigValue = () => 1;
    p.imageAgeInfo.newestDate = "2001-01-03T05:00:00.000Z";
    const wrapper = shallow<ImageFilterMenu>(<ImageFilterMenu {...p} />);
    wrapper.instance().sliderChange(1);
    expect(wrapper.instance().state.slider).toEqual(1);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("displays slider labels", () => {
    const p = fakeProps();
    p.imageAgeInfo.newestDate = "2001-01-03T00:00:00.000Z";
    const wrapper = mount(<ImageFilterMenu {...p} />);
    ["Jan-1", "Jan-2", "Jan-3"].map(date =>
      expect(wrapper.text()).toContain(date));
  });
});
