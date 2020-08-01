import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { getPathArray } from "../history";
import { TaggedToolSlotPointer } from "farmbot";
import { edit, save, destroy } from "../api/crud";
import { push } from "../history";
import { Panel } from "../farm_designer/panel_header";
import { SlotEditRows } from "./tool_slot_edit_components";
import { moveAbs } from "../devices/actions";
import { hasUTM } from "../settings/firmware/firmware_hardware_support";
import { mapStateToPropsEdit } from "./state_to_props";
import { EditToolSlotProps } from "./interfaces";
import { setToolHover } from "../farm_designer/map/layers/tool_slots/tool_graphics";

export class RawEditToolSlot extends React.Component<EditToolSlotProps> {

  get stringyID() { return getPathArray()[4] || ""; }
  get toolSlot() { return this.props.findToolSlot(this.stringyID); }
  get tool() {
    return this.toolSlot && this.props.findTool(this.toolSlot.body.tool_id || 0);
  }

  componentWillUnmount = () => this.props.dispatch(setToolHover(undefined));

  updateSlot = (toolSlot: TaggedToolSlotPointer) =>
    (update: Partial<TaggedToolSlotPointer["body"]>) => {
      this.props.dispatch(edit(toolSlot, update));
      this.props.dispatch(save(toolSlot.uuid));
    }

  render() {
    const { toolSlot } = this;
    const toolsPath = "/app/designer/tools";
    const toolSlotsPath = "/app/designer/tool-slots";
    !toolSlot && getPathArray().join("/").startsWith(toolSlotsPath)
      && push(toolsPath);
    const panelName = "edit-tool-slot";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit slot")}
        backTo={toolsPath}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {toolSlot
          ? <div className={"edit-tool-slot-content-wrapper"}>
            <SlotEditRows
              noUTM={!hasUTM(this.props.firmwareHardware)}
              toolSlot={toolSlot}
              tools={this.props.tools}
              tool={this.tool}
              botPosition={this.props.botPosition}
              toolTransformProps={this.props.toolTransformProps}
              isActive={this.props.isActive}
              updateToolSlot={this.updateSlot(toolSlot)} />
            <ul className="meta">
              {Object.entries(toolSlot.body.meta).map(([key, value]) => {
                switch (key) {
                  default:
                    return <li key={key}>
                      <label>{key}</label>
                      <div>{value}</div>
                    </li>;
                }
              })}
            </ul>
            <button
              className="fb-button gray no-float"
              title={t("move to this location")}
              onClick={() => {
                const x = toolSlot.body.gantry_mounted
                  ? this.props.botPosition.x ?? toolSlot.body.x
                  : toolSlot.body.x;
                const { y, z } = toolSlot.body;
                moveAbs({ x, y, z });
              }}>
              {t("Move FarmBot to slot location")}
            </button>
            <button
              className="fb-button red no-float"
              title={t("Delete")}
              onClick={() => this.props.dispatch(destroy(toolSlot.uuid))}>
              {t("Delete")}
            </button>
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditToolSlot = connect(mapStateToPropsEdit)(RawEditToolSlot);
