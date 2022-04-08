import { Meta } from "../../shared"

export enum ActionTypes {
  UpdateLoadingStatus,
  UpdateMeta,
  UpdateNumImagesSqrt,
  UpdateImgSquareSize,
  UpdateImgArray,
  UpdateResizedImages,
  UpdateMessenger,
  UpdateAlerts,
  AddAlert,
  UpdateIsReloading,
  UpdateIsOffline
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
interface UpdateAlerts extends BaseAction {
  type: ActionTypes.UpdateAlerts,
  alerts: AlertItem[]
}
interface AddAlert extends BaseAction {
  type: ActionTypes.AddAlert,
  alert: AlertItem
}
interface UpdateIsReloading extends BaseAction {
  type: ActionTypes.UpdateIsReloading,
  isReloading: boolean
}
interface UpdateIsOffline extends BaseAction {
  type: ActionTypes.UpdateIsOffline,
  isOffline: boolean
}

export type Action = UpdateLoadingStatus | UpdateMeta | UpdateNumImagesSqrt | UpdateImgSquareSize |
  UpdateImgArray | UpdateResizedImages | UpdateMessenger | UpdateAlerts | AddAlert | UpdateIsReloading | UpdateIsOffline;

export interface DispatchActions {
  updateLoadingStatus: (isLoading: boolean) => void,
  updateMeta: (meta: Meta) => void,
  updateNumImagesSqrt: (numImagesSqrt: number) => void,
  updateImgSquareSize: (imgSquareSize: number) => void,
  updateImgArray: (imgArray: number[]) => void,
  updateResizedImages: (resizedUrls: string[]) => void,
  updateMessenger: (messenger: Messenger) => void,
  updateFromMessage: (action: Action) => void,
  updateAlerts: (alerts: AlertItem[]) => void,
  addAlert: (alert: AlertItem) => void,
  updateIsReloading: (isReloading: boolean) => void,
  updateIsOffline: (isOffline: boolean) => void
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
    updateFromMessage: (action: Action) => dispatch(action),
    updateAlerts: (alerts: AlertItem[]) => dispatch({type: ActionTypes.UpdateAlerts, alerts}),
    addAlert: (alert: AlertItem) => dispatch({type: ActionTypes.AddAlert, alert}),
    updateIsReloading: (isReloading: boolean) => dispatch({type: ActionTypes.UpdateIsReloading, isReloading}),
    updateIsOffline: (isOffline: boolean) => dispatch({type: ActionTypes.UpdateIsOffline, isOffline})
  };
};
