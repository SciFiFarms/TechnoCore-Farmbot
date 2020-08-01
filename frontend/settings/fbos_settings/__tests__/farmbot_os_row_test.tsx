import * as React from "react";
import { FarmbotOsRow, getOsReleaseNotesForVersion } from "../farmbot_os_row";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FarmbotOsRowProps } from "../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("<FarmbotOsRow/>", () => {
  const fakeProps = (): FarmbotOsRowProps => ({
    bot,
    dispatch: jest.fn(x => x(jest.fn(), fakeState)),
    sourceFbosConfig: (x) => {
      return { value: bot.hardware.configuration[x], consistent: true };
    },
    shouldDisplay: () => false,
    botOnline: false,
    deviceAccount: fakeDevice(),
    timeSettings: fakeTimeSettings(),
  });

  it("renders", () => {
    const wrapper = mount(<FarmbotOsRow {...fakeProps()} />);
    ["FarmBot OS", "Version", "Release Notes"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("shows beta version string", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    p.bot.hardware.informational_settings.currently_on_beta = true;
    const wrapper = mount(<FarmbotOsRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("1.0.0-beta");
  });
});

describe("getOsReleaseNotesForVersion()", () => {
  it("fetches OS release notes", () => {
    const mockData = "intro\n\n# v6\n\n* note";
    const result = getOsReleaseNotesForVersion(mockData, "6.0.0");
    expect(result.heading).toEqual("FarmBot OS v6");
    expect(result.notes).toEqual("* note");
  });
});
