import { h, Fragment, ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { JSONObject } from "../../../shared";
import { Action, ActionTypes } from "../actions";
import { useStore } from "../hooks";
import apiFactory from "../lib/api";
import { getImageResizeOpts, getResizedImageUrls } from "../lib/images";
import messagesFactory from "../lib/messages";
import Loading from "./Loading";

const DataInitializer = (props: {children: ComponentChildren}) => {
  const {state, dispatch} = useStore();

  const api = apiFactory();

  const init = async () => {
    const meta = await api.getMeta();
    dispatch({
      type: ActionTypes.UpdateMeta,
      meta
    });
    const numImagesSqrt = await api.getNumImagesSqrt();
    dispatch({
      type: ActionTypes.UpdateNumImagesSqrt,
      numImagesSqrt
    });
    const imgSquareSize = await api.getImgSquareSize();
    dispatch({
      type: ActionTypes.UpdateImgSquareSize,
      imgSquareSize
    });
    const imgResizeOpts = getImageResizeOpts(meta.imgWidth, meta.imgHeight, numImagesSqrt);
    const resizedImages = await getResizedImageUrls(numImagesSqrt, imgResizeOpts);
    dispatch({
      type: ActionTypes.UpdateResizedImages,
      resizedImages
    });
    dispatch({
      type: ActionTypes.UpdateLoadingStatus,
      isLoading: false
    });
    dispatch({
      type: ActionTypes.UpdateMessenger,
      messenger: messagesFactory(messageHandler, errorHandler)
    });
    console.log("Data initializer finished loading");
  };

  const messageHandler = (data: JSONObject): void => {
    if (data.type === undefined) {
      console.error("Unrecognized message format", data);
      return;
    }
    console.debug("Received message", data);
    dispatch((data as unknown) as Action);
  };
  const errorHandler = (error: Error): void => {
    console.error("Messenger Error", error);
    // TODO: Uncomment below once we have a handle on bugs
    // window.location.reload();
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
