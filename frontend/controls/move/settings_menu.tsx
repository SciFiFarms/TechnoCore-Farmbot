import * as React from "react";
import { BooleanSetting } from "../../session_keys";
import { ToggleButton } from "../toggle_button";
import { ToggleWebAppBool, GetWebAppBool } from "./interfaces";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { t } from "../../i18next_wrapper";
import { FirmwareHardware } from "farmbot";
import { hasEncoders } from "../../settings/firmware/firmware_hardware_support";
import { DeviceSetting } from "../../constants";

export const moveWidgetSetting =
  (toggle: ToggleWebAppBool, getValue: GetWebAppBool) =>
    ({ label, setting }: { label: DeviceSetting, setting: BooleanConfigKey }) =>
      <fieldset>
        <label>
          {t(label)}
        </label>
        <ToggleButton
          toggleAction={toggle(BooleanSetting[setting])}
          toggleValue={getValue(setting)} />
      </fieldset>;

export interface MoveWidgetSettingsMenuProps {
  toggle: ToggleWebAppBool;
  getValue: GetWebAppBool;
  firmwareHardware: FirmwareHardware | undefined;
}

export const MoveWidgetSettingsMenu = (
  { toggle, getValue, firmwareHardware }: MoveWidgetSettingsMenuProps,
) => {
  const Setting = moveWidgetSetting(toggle, getValue);
  return <div className="move-settings-menu">
    <p>{t("Invert Jog Buttons")}</p>
    <Setting label={DeviceSetting.invertJogButtonXAxis}
      setting={BooleanSetting.x_axis_inverted} />
    <Setting label={DeviceSetting.invertJogButtonYAxis}
      setting={BooleanSetting.y_axis_inverted} />
    <Setting label={DeviceSetting.invertJogButtonZAxis}
      setting={BooleanSetting.z_axis_inverted} />

    {hasEncoders(firmwareHardware) &&
      <div className="display-encoder-data">
        <p>{t("Display Encoder Data")}</p>
        <Setting
          label={DeviceSetting.displayScaledEncoderPosition}
          setting={BooleanSetting.scaled_encoders} />
        <Setting
          label={DeviceSetting.displayRawEncoderPosition}
          setting={BooleanSetting.raw_encoders} />
      </div>}

    <p>{t("Swap jog buttons (and rotate map)")}</p>
    <Setting label={DeviceSetting.swapJogButtonsXAndYAxis}
      setting={BooleanSetting.xy_swap} />

    <p>{t("Home button behavior")}</p>
    <Setting
      label={DeviceSetting.homeButtonBehaviorPerformHoming}
      setting={BooleanSetting.home_button_homing} />

    <div className={"motor-position-plot-setting-row"}>
      <p>{t("Motor position plot")}</p>
      <Setting
        label={DeviceSetting.showMotorPositionPlot}
        setting={BooleanSetting.show_motor_plot} />
    </div>
  </div>;
};
