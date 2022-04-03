import { h, Fragment, ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { JSONObject } from "../../../shared";
import { Action } from "../actions";
import { useStore } from "../hooks";
import apiFactory from "../lib/api";
import { getDiffResizedImageUrls } from "../lib/images";
import messagesFactory from "../lib/messages";
import Spinner from "./Spinner";

const DataInitializer = (props: {children: ComponentChildren}) => {
  const {state, actions} = useStore();
  // Keep a copy of values that cause secondary effects so we can use them for comparison
  const [imgArray, setImgArray] = useState<number[]>([]);
  const [numImagesSqrt, setNumImagesSqrt] = useState<number>(0);

  const api = apiFactory();

  const init = async () => {
    // Request all init values in parallel and update them
    const [meta, numImagesSqrt, imgArray, imgSquareSize] = await Promise.all([api.getMeta(), api.getNumImagesSqrt(), api.getImgArray(), api.getImgSquareSize()]);
    actions.updateMeta(meta);
    actions.updateNumImagesSqrt(numImagesSqrt);
    actions.updateImgArray(imgArray);
    actions.updateImgSquareSize(imgSquareSize);
    // Update secondary values
    actions.updateResizedImages(await getDiffResizedImageUrls(meta.imgWidth, meta.imgHeight, imgSquareSize, null, imgArray, null, numImagesSqrt, null));
    // Save a copy of values that will affect secondaries
    setNumImagesSqrt(numImagesSqrt);
    setImgArray(imgArray);
    // Finalize init
    actions.updateMessenger(messagesFactory(messageHandler, errorHandler));
    actions.updateLoadingStatus(false);
    console.log("Finished initialization.");
  };
  
  const updateSecondaryValues = async () => {
    if (state.meta === null || state.numImagesSqrt === null || state.imgArray === null || state.imgSquareSize === null) {
      return;
    }
    actions.updateResizedImages(await getDiffResizedImageUrls(state.meta.imgWidth, state.meta.imgHeight, state.imgSquareSize, imgArray, state.imgArray, numImagesSqrt, state.numImagesSqrt, state.resizedImages));
    setImgArray(state.imgArray);
    setNumImagesSqrt(state.numImagesSqrt);
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

  // Fires once on first load to get init values
  useEffect(() => {
    init();
  }, []);

  // Fires whenever values that have secondary effects are changed
  useEffect(() => {
    updateSecondaryValues();
  }, [state.imgArray, state.numImagesSqrt]);

  if (state.isLoading) {
    return (
      <Spinner />
    );
  }

  return (
    <Fragment>{props.children}</Fragment>
  );
};

export default DataInitializer;
