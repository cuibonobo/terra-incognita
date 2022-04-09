import { h, Fragment, ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { JSONObject } from "../../../shared";
import { Action } from "../actions";
import { useStore } from "../hooks";
import apiFactory, { reloadIfOnline } from "../lib/api";
import { getDiffResizedImageUrls } from "../lib/images";
import messagesFactory, { RateLimitError } from "../lib/messages";
import Spinner from "./Spinner";
import Alerts from "./Alerts";
import { useLocation } from "react-router-dom";

const OFFLINE_TIMEOUT = 60;
const OFFLINE_RETRIES = 30;

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
    // Request artwork metadata and start the messenger
    actions.updateMeta(await api.getMeta());
    actions.updateMessenger(messagesFactory(messageHandler, errorHandler));
    console.log("Finished initialization.");
  };
  
  const updateSecondaryValues = async () => {
    if (state.meta === null || state.numImagesSqrt === null || state.imgArray === null || state.imgSquareSize === null) {
      return;
    }
    actions.updateResizedImages(await getDiffResizedImageUrls(state.meta.imgWidth, state.meta.imgHeight, state.imgSquareSize, imgArray, state.imgArray, numImagesSqrt, state.numImagesSqrt, state.resizedImages));
    actions.updateLoadingStatus(false);
    setImgArray(state.imgArray);
    setNumImagesSqrt(state.numImagesSqrt);
  };

  const messageHandler = (data: JSONObject): void => {
    if (data.ready) {
      actions.updateAppState(data.imgArray as number[], data.imgSquareSize as number, data.numImagesSqrt as number);
      actions.updateIsOffline(false);
      return;
    }
    if (data.type === undefined) {
      console.error("Unrecognized message format", data);
      return;
    }
    console.debug("Received message", data);
    actions.updateFromMessage((data as unknown) as Action);
  };
  const errorHandler = <T extends Error>(error: T): void => {
    console.error(error.name, error.message);
    if (error instanceof RateLimitError) {
      actions.addAlert({content: error.message, isError: true});
    } else {
      if (location.pathname === '/artwork' && !state.isReloading) {
        reloadIfOnline(OFFLINE_TIMEOUT, OFFLINE_RETRIES);
        actions.updateIsReloading(true);
      }
      actions.updateIsOffline(true);
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
