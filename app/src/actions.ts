import { Meta } from "../../shared"

export enum ActionTypes {
  UpdateLoadingStatus,
  UpdateMeta,
  UpdateNumImagesSqrt,
  UpdateImgSquareSize,
  UpdateImgArray,
  UpdateResizedImages,
  UpdateMessenger
}

interface BaseAction {
  type: ActionTypes,
  sessionId?: string,
  timestamp?: number
}

type Messenger = {send: (data: any) => void};

interface UpdateLoadingStatus extends BaseAction {
  type: ActionTypes.UpdateLoadingStatus,
  isLoading: boolean
}
interface UpdateMeta extends BaseAction {
  type: ActionTypes.UpdateMeta,
  meta: Meta
}
interface UpdateNumImagesSqrt extends BaseAction {
  type: ActionTypes.UpdateNumImagesSqrt,
  numImagesSqrt: number
}
interface UpdateImgSquareSize extends BaseAction {
  type: ActionTypes.UpdateImgSquareSize,
  imgSquareSize: number
}
interface UpdateImgArray extends BaseAction {
  type: ActionTypes.UpdateImgArray,
  imgArray: number[]
}
interface UpdateResizedImages extends BaseAction {
  type: ActionTypes.UpdateResizedImages,
  resizedImages: string[]
}
interface UpdateMessenger extends BaseAction {
  type: ActionTypes.UpdateMessenger,
  messenger: Messenger
}

export type Action = UpdateLoadingStatus | UpdateMeta | UpdateNumImagesSqrt | UpdateImgSquareSize | UpdateImgArray | UpdateResizedImages | UpdateMessenger;

export interface DispatchActions {
  updateLoadingStatus: (isLoading: boolean) => void,
  updateMeta: (meta: Meta) => void,
  updateNumImagesSqrt: (numImagesSqrt: number) => void,
  updateImgSquareSize: (imgSquareSize: number) => void,
  updateImgArray: (imgArray: number[]) => void,
  updateResizedImages: (resizedUrls: string[]) => void,
  updateMessenger: (messenger: Messenger) => void,
  updateFromMessage: (action: Action) => void
}

export const createDispatchActions = (dispatch: (action: Action) => void): DispatchActions => {
  return {
    updateLoadingStatus: (isLoading: boolean) => dispatch({type: ActionTypes.UpdateLoadingStatus, isLoading}),
    updateMeta: (meta: Meta) => dispatch({type: ActionTypes.UpdateMeta, meta}),
    updateNumImagesSqrt: (numImagesSqrt: number) => dispatch({type: ActionTypes.UpdateNumImagesSqrt, numImagesSqrt}),
    updateImgSquareSize: (imgSquareSize: number) => dispatch({type: ActionTypes.UpdateImgSquareSize, imgSquareSize}),
    updateImgArray: (imgArray: number[]) => dispatch({type: ActionTypes.UpdateImgArray, imgArray}),
    updateResizedImages: (resizedImages: string[]) => dispatch({type: ActionTypes.UpdateResizedImages, resizedImages}),
    updateMessenger: (messenger: Messenger) => dispatch({type: ActionTypes.UpdateMessenger, messenger}),
    updateFromMessage: (action: Action) => dispatch(action)
  };
};
