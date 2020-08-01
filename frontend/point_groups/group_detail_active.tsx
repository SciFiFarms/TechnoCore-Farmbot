import * as React from "react";
import { t } from "../i18next_wrapper";
import { TaggedPointGroup, TaggedPoint, PointType, TaggedTool } from "farmbot";
import { DeleteButton } from "../ui/delete_button";
import { save, edit } from "../api/crud";
import { Paths } from "./paths";
import { Feature, ShouldDisplay } from "../devices/interfaces";
import { ErrorBoundary } from "../error_boundary";
import {
  GroupCriteria, GroupPointCountBreakdown, pointsSelectedByGroup,
} from "./criteria";
import { ToolTips } from "../constants";
import { UUID } from "../resources/interfaces";
import { Help } from "../ui";
import { BotSize } from "../farm_designer/map/interfaces";
import { setSelectionPointType } from "../plants/select_plants";
import { ToolTransformProps } from "../tools/interfaces";

export interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
  shouldDisplay: ShouldDisplay;
  slugs: string[];
  hovered: UUID | undefined;
  editGroupAreaInMap: boolean;
  botSize: BotSize;
  selectionPointType: PointType[] | undefined;
  tools: TaggedTool[];
  toolTransformProps: ToolTransformProps;
}

interface GroupDetailActiveState {
  iconDisplay: boolean;
}

export class GroupDetailActive
  extends React.Component<GroupDetailActiveProps, GroupDetailActiveState> {
  state: GroupDetailActiveState = { iconDisplay: true };

  get pointsSelectedByGroup() {
    return pointsSelectedByGroup(this.props.group, this.props.allPoints);
  }

  componentWillUnmount = () =>
    this.props.dispatch(setSelectionPointType(undefined));

  toggleIconShow = () => this.setState({ iconDisplay: !this.state.iconDisplay });

  render() {
    const { group, dispatch } = this.props;
    return <ErrorBoundary>
      <label>{t("GROUP NAME")}</label>
      <input
        name="name"
        defaultValue={group.body.name}
        onBlur={e => {
          const newGroupName = e.currentTarget.value;
          if (newGroupName != "" && newGroupName != this.props.group.body.name) {
            this.props.dispatch(edit(this.props.group, { name: newGroupName }));
            this.props.dispatch(save(this.props.group.uuid));
          }
        }} />
      <GroupSortSelection group={group} dispatch={dispatch}
        pointsSelectedByGroup={this.pointsSelectedByGroup} />
      <GroupMemberDisplay group={group} dispatch={dispatch}
        pointsSelectedByGroup={this.pointsSelectedByGroup}
        hovered={this.props.hovered}
        iconDisplay={this.state.iconDisplay}
        toggleIconShow={this.toggleIconShow}
        tools={this.props.tools}
        toolTransformProps={this.props.toolTransformProps}
        shouldDisplay={this.props.shouldDisplay} />
      {this.props.shouldDisplay(Feature.criteria_groups) &&
        <GroupCriteria dispatch={dispatch}
          group={group} slugs={this.props.slugs} botSize={this.props.botSize}
          editGroupAreaInMap={this.props.editGroupAreaInMap}
          selectionPointType={this.props.selectionPointType} />}
      <DeleteButton
        className="group-delete-btn"
        dispatch={dispatch}
        uuid={group.uuid}
        onDestroy={history.back}>
        {t("DELETE GROUP")}
      </DeleteButton>
    </ErrorBoundary>;
  }
}

interface GroupSortSelectionProps {
  group: TaggedPointGroup;
  dispatch: Function;
  pointsSelectedByGroup: TaggedPoint[];
}

/** Choose and view group point sort method. */
const GroupSortSelection = (props: GroupSortSelectionProps) =>
  <div className={"group-sort-section"}>
    <label>
      {t("SORT BY")}
    </label>
    {props.group.body.sort_type == "random" &&
      <Help
        text={ToolTips.SORT_DESCRIPTION}
        customIcon={"exclamation-triangle"} />}
    <Paths
      key={JSON.stringify(props.pointsSelectedByGroup
        .map(p => p.body.id))}
      pathPoints={props.pointsSelectedByGroup}
      dispatch={props.dispatch}
      group={props.group} />
  </div>;

interface GroupMemberDisplayProps {
  group: TaggedPointGroup;
  dispatch: Function;
  pointsSelectedByGroup: TaggedPoint[];
  shouldDisplay: ShouldDisplay;
  iconDisplay: boolean;
  toggleIconShow(): void;
  hovered: UUID | undefined;
  tools: TaggedTool[];
  toolTransformProps: ToolTransformProps;
}

/** View group point counts and icon list. */
const GroupMemberDisplay = (props: GroupMemberDisplayProps) => {
  return <div className="group-member-display">
    <label>
      {t("GROUP MEMBERS ({{count}})", {
        count: props.pointsSelectedByGroup.length
      })}
    </label>
    <Help text={`${t("Click plants in map to add or remove.")} ${(
      props.shouldDisplay(Feature.criteria_groups) &&
      props.pointsSelectedByGroup.length != props.group.body.point_ids.length)
      ? t(ToolTips.CRITERIA_SELECTION_COUNT) : ""}`} />
    <i onClick={props.toggleIconShow}
      className={`fa fa-caret-${props.iconDisplay ? "up" : "down"}`}
      title={props.iconDisplay
        ? t("hide icons")
        : t("show icons")} />
    <GroupPointCountBreakdown
      group={props.group}
      dispatch={props.dispatch}
      shouldDisplay={props.shouldDisplay}
      iconDisplay={props.iconDisplay}
      hovered={props.hovered}
      tools={props.tools}
      toolTransformProps={props.toolTransformProps}
      pointsSelectedByGroup={props.pointsSelectedByGroup} />
  </div>;
};
