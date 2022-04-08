import { h, Fragment, ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { JSONObject } from "../../../shared";
import { Action } from "../actions";
import { useStore } from "../hooks";
import apiFactory from "../lib/api";
import { getDiffResizedImageUrls } from "../lib/images";
import messagesFactory, { RateLimitError } from "../lib/messages";
import Spinner from "./Spinner";
import Alerts from "./Alerts";
import { useLocation } from "react-router-dom";

const RELOAD_TIMEOUT = 3;

const DataInitializer = (props: {children: ComponentChildren}) => {
  const {state, actions} = useStore();
  const location = useLocation();
  // Keep a copy of values that cause secondary effects so we can use them for comparison
  const [imgArray, setImgArray] = useState<number[]>([]);
  const [numImagesSqrt, setNumImagesSqrt] = useState<number>(0);

  const api = apiFactory();

  const init = async () => {
    // Don't block loading for pages that don't show artwork
    if (location.pathname === '/about' || location.pathname === '/qrcode') {
      actions.updateLoadingStatus(false);
    }
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
      const content = "Unrecognized message format";
      console.error(content, data);
      actions.addAlert({content, isError: true});
      return;
    }
    console.debug("Received message", data);
    actions.updateFromMessage((data as unknown) as Action);
  };
  const errorHandler = <T extends Error>(error: T): void => {
    console.error(error.name, error.message);
    actions.addAlert({content: error.message, isError: true});
    if (!(error instanceof RateLimitError)) {
      actions.addAlert({content: `Reloading page in ${RELOAD_TIMEOUT} seconds`});
      setTimeout(() => window.location.reload(), RELOAD_TIMEOUT * 1000);
    }
  };

  // Fires once on first load to get init values
  useEffect(() => {
    init();
  }, []);

  // Fires whenever values that have secondary effects are changed
  useEffect(() => {
    updateSecondaryValues();
  }, [state.imgArray, state.numImagesSqrt]);

  return (
    <Fragment>
      <Alerts />
      {state.isLoading ? <Spinner /> : props.children}
    </Fragment>
  );
};

export default DataInitializer;
