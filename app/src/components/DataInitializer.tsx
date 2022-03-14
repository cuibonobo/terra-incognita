import { h, Fragment, ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import { ActionTypes } from "../actions";
import { useStore } from "../hooks";
import apiFactory from "../lib/api";
import { getImageResizeOpts, getResizedImageUrls } from "../lib/images";
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
    console.log("Data initializer finished loading");
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
