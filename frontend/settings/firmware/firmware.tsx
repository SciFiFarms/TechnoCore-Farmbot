import * as React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { FirmwareProps } from "./interfaces";
import { FbosButtonRow } from "../fbos_settings/fbos_button_row";
import { Content, DeviceSetting } from "../../constants";
import { restartFirmware } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { BoardType } from "./board_type";
import { isFwHardwareValue } from "./firmware_hardware_support";
import { FlashFirmwareRow } from "./flash_firmware_row";

export function Firmware(props: FirmwareProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const { firmware } = props.bot.controlPanelState;

  const { value } = props.sourceFbosConfig("firmware_hardware");
  const firmwareHardware = isFwHardwareValue(value) ? value : undefined;
  return <Highlight className={"section"}
    settingName={DeviceSetting.firmwareSection}>
    <Header
      title={DeviceSetting.firmwareSection}
      panel={"firmware"}
      dispatch={dispatch}
      expanded={firmware} />
    <Collapse isOpen={!!firmware}>
      <BoardType
        botOnline={botOnline}
        bot={props.bot}
        alerts={props.alerts}
        dispatch={props.dispatch}
        shouldDisplay={props.shouldDisplay}
        timeSettings={props.timeSettings}
        firmwareHardware={firmwareHardware}
        sourceFbosConfig={sourceFbosConfig} />
      <FbosButtonRow
        botOnline={botOnline}
        label={DeviceSetting.restartFirmware}
        description={Content.RESTART_FIRMWARE}
        buttonText={t("RESTART")}
        color={"yellow"}
        action={restartFirmware} />
      <FlashFirmwareRow
        botOnline={botOnline}
        firmwareHardware={firmwareHardware} />
    </Collapse>
  </Highlight>;
}
