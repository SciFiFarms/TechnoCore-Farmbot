import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { ToursWidget } from "../help/tour_list";
import { DocsWidget } from "../help/docs";
import { Actions } from "../constants";
import { Everything } from "../interfaces";

export interface HelpPanelProps {
  dispatch: Function;
}

export const mapStateToProps = (props: Everything): HelpPanelProps => ({
  dispatch: props.dispatch,
});

export class RawHelpPanel extends React.Component<HelpPanelProps, {}> {

  componentDidMount() {
    this.props.dispatch({ type: Actions.START_TOUR, payload: undefined });
  }

  render() {
    return <DesignerPanel panelName={"help"} panel={Panel.Help}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"help"}>
        <ToursWidget dispatch={this.props.dispatch} />
        <DocsWidget />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const HelpPanel = connect(mapStateToProps)(RawHelpPanel);
