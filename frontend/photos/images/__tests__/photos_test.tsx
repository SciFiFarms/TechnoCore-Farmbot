const mockDevice = { takePhoto: jest.fn(() => Promise.resolve({})) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { Photos, PhotoFooter, PhotoFooterProps } from "../photos";
import { JobProgress } from "farmbot";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { destroy } from "../../../api/crud";
import { clickButton } from "../../../__test_support__/helpers";
import { PhotosProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { success, error } from "../../../toast/toast";
import { Content, ToolTips, Actions } from "../../../constants";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";

describe("<Photos/>", () => {
  const fakeProps = (): PhotosProps => ({
    images: [],
    currentImage: undefined,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    imageJobs: [],
    botToMqttStatus: "up",
    syncStatus: "synced",
    env: {},
    hiddenImages: [],
    shownImages: [],
    hideUnShownImages: false,
    alwaysHighlightImage: false,
    getConfigValue: jest.fn(),
  });

  it("shows photo", () => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    p.getConfigValue = jest.fn(key => config.body[key]);
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("Created At:June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:164");
    expect(wrapper.find(".fa-eye.green").length).toEqual(1);
  });

  it("shows photo not in map", () => {
    const p = fakeProps();
    const images = fakeImages;
    p.currentImage = images[1];
    p.currentImage.body.meta.z = 100;
    p.env["CAMERA_CALIBRATION_camera_z"] = "0";
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("Created At:June 1st, 2017");
    expect(wrapper.text()).toContain("X:632Y:347Z:100");
    expect(wrapper.find(".fa-eye-slash.gray").length).toEqual(1);
  });

  it("no photos", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    expect(wrapper.text()).toContain("Image:No meta data.");
  });

  it("takes photo", async () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    const btn = wrapper.find("button").first();
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    await clickButton(wrapper, 0, "take photo");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    await expect(success).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("shows disabled take photo button", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = mount(<Photos {...p} />);
    const btn = wrapper.find("button").first();
    expect(btn.text()).toEqual("Take Photo");
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, Content.NO_CAMERA_SELECTED);
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
  });

  it("fails to take photo", async () => {
    mockDevice.takePhoto = jest.fn(() => Promise.reject());
    const wrapper = mount(<Photos {...fakeProps()} />);
    await clickButton(wrapper, 0, "take photo");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    await expect(error).toHaveBeenCalled();
  });

  it("deletes photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    await button.simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(success).toHaveBeenCalled();
  });

  it("fails to delete photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject("error"));
    const images = fakeImages;
    p.currentImage = images[1];
    const wrapper = mount(<Photos {...p} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    await button.simulate("click");
    await expect(destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await expect(error).toHaveBeenCalled();
  });

  it("deletes most recent photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    p.images = fakeImages;
    const wrapper = mount(<Photos {...p} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    await button.simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.images[0].uuid);
    await expect(success).toHaveBeenCalled();
  });

  it("no photos to delete", () => {
    const wrapper = mount(<Photos {...fakeProps()} />);
    const button = wrapper.find("button").at(1);
    expect(button.find("i").hasClass("fa-trash")).toBeTruthy();
    button.simulate("click");
    expect(destroy).not.toHaveBeenCalledWith();
  });

  it("shows image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [{
      status: "working",
      percent: 15,
      unit: "percent",
      time: "2018-11-15 19:13:21.167440Z"
    } as JobProgress];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("uploading photo...15%");
  });

  it("doesn't show image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [{
      status: "complete",
      percent: 15,
      unit: "percent",
      time: "2018-11-15 19:13:21.167440Z"
    } as JobProgress];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).not.toContain("uploading");
  });

  it("can't find meta field data", () => {
    const p = fakeProps();
    p.images = fakeImages;
    p.images[0].body.meta.x = undefined;
    p.currentImage = p.images[0];
    const wrapper = mount(<Photos {...p} />);
    expect(wrapper.text()).toContain("X:unknown");
  });

  it("flips photo", () => {
    const p = fakeProps();
    p.images = fakeImages;
    const wrapper = shallow(<Photos {...p} />);
    wrapper.find("ImageFlipper").simulate("flip", "uuid");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_IMAGE, payload: "uuid",
    });
  });

  it("updates photo size", () => {
    const p = fakeProps();
    p.images = fakeImages;
    const wrapper = shallow<Photos>(<Photos {...p} />);
    expect(wrapper.state().imageWidth).toEqual(0);
    expect(wrapper.state().imageHeight).toEqual(0);
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", {
      value: 10, configurable: true,
    });
    Object.defineProperty(img, "naturalHeight", {
      value: 20, configurable: true,
    });
    wrapper.instance().imageLoadCallback(img);
    expect(wrapper.state().imageWidth).toEqual(10);
    expect(wrapper.state().imageHeight).toEqual(20);
  });

  it("toggles state", () => {
    const wrapper = shallow<Photos>(<Photos {...fakeProps()} />);
    expect(wrapper.state().crop).toEqual(true);
    expect(wrapper.state().rotate).toEqual(true);
    wrapper.instance().toggleCrop();
    wrapper.instance().toggleRotation();
    expect(wrapper.state().crop).toEqual(false);
    expect(wrapper.state().rotate).toEqual(false);
  });

  it("unselects photos upon exit", () => {
    const p = fakeProps();
    const wrapper = mount(<Photos {...p} />);
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES, payload: [],
    });
  });
});

describe("<PhotoFooter />", () => {
  const fakeProps = (): PhotoFooterProps => ({
    image: undefined,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    flags: fakeImageShowFlags(),
  });

  it("highlights map image", () => {
    const p = fakeProps();
    p.image = fakeImage();
    p.image.body.id = 1;
    const wrapper = mount(<PhotoFooter {...p} />);
    wrapper.find("i").first().simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    wrapper.find("i").first().simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });
});
