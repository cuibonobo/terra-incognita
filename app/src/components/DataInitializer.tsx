import { h, Fragment, ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { JSONObject } from "../../../shared";
import { Action } from "../actions";
import { useStore } from "../hooks";
import apiFactory from "../lib/api";
import messagesFactory from "../lib/messages";
import Loading from "./Loading";

const DataInitializer = (props: {children: ComponentChildren}) => {
  const {state, actions} = useStore();

  const api = apiFactory();

  const init = async () => {
    actions.updateMeta(await api.getMeta());
    actions.updateNumImagesSqrt(await api.getNumImagesSqrt());
    actions.updateImgSquareSize(await api.getImgSquareSize());
    actions.updateImgArray(await api.getImgArray());
    actions.updateMessenger(messagesFactory(messageHandler, errorHandler));
    actions.updateLoadingStatus(false);
    console.log("Data initializer finished loading");
  };

  const messageHandler = (data: JSONObject): void => {
    if (data.type === undefined) {
      console.error("Unrecognized message format", data);
      return;
    }
    console.debug("Received message", data);
    actions.updateFromMessage((data as unknown) as Action);
  };
  const errorHandler = (error: Error): void => {
    console.error("Messenger Error", error);
    // TODO: Block the UI for rate-limiter errors and reset to the last
    // state. Reload the page for other errors.
  };

  useEffect(() => {
    init();
  }, []);

  if (state.isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <Fragment>{props.children}</Fragment>
  );
};

export default DataInitializer;
