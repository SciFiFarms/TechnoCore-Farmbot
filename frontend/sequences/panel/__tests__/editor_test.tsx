jest.mock("../../../sequences/set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawDesignerSequenceEditor as DesignerSequenceEditor,
} from "../editor";
import { Props } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, FAKE_RESOURCES,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../../__test_support__/fake_sequence_step_data";
import { mapStateToFolderProps } from "../../../folders/map_state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  setActiveSequenceByName,
} from "../../set_active_sequence_by_name";

describe("<DesignerSequenceEditor />", () => {
  const fakeProps = (): Props => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    sequences: [],
    resources: buildResourceIndex(FAKE_RESOURCES).index,
    syncStatus: "synced",
    hardwareFlags: fakeHardwareFlags(),
    farmwareData: fakeFarmwareData(),
    shouldDisplay: jest.fn(),
    getWebAppConfigValue: jest.fn(),
    menuOpen: false,
    stepIndex: undefined,
    folderData: mapStateToFolderProps(fakeState()),
  });

  it("renders", () => {
    const wrapper = mount(<DesignerSequenceEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("save");
  });

  it("handles missing sequence", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(wrapper.text().toLowerCase()).toContain("no sequence selected");
  });
});
