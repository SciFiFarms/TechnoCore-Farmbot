jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
}));

import React from "react";
import { shallow } from "enzyme";
import { AccountSettingsProps, AccountSettings } from "../account_settings";
import { panelState } from "../../../__test_support__/control_panel_state";
import { fakeUser } from "../../../__test_support__/fake_state/resources";
import { edit } from "../../../api/crud";
import { success } from "../../../toast/toast";
import { Content } from "../../../constants";

describe("<AccountSettings />", () => {
  const fakeProps = (): AccountSettingsProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    user: fakeUser(),
    getConfigValue: jest.fn(),
  });

  it("changes name", () => {
    const p = fakeProps();
    p.user.body.name = "";
    const wrapper = shallow(<AccountSettings {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(edit).toHaveBeenCalledWith(p.user, { name: "new name" });
  });

  it("changes email", () => {
    const p = fakeProps();
    p.user.body.email = "";
    const wrapper = shallow(<AccountSettings {...p} />);
    wrapper.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "new email" }
    });
    expect(edit).toHaveBeenCalledWith(p.user, { email: "new email" });
    expect(success).toHaveBeenCalledWith(Content.CHECK_EMAIL_TO_CONFIRM);
  });
});
