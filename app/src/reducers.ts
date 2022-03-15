import { Action, ActionTypes } from "./actions";
import { AppState } from "./store";

export const appReducer = (state: AppState, action: Action): AppState => {
  // For every state change, send a message through the messenger
  if (state.messenger && action.type !== ActionTypes.UpdateMessenger) {
    state.messenger.send(action);
  }
  switch(action.type) {
    case ActionTypes.UpdateLoadingStatus:
      return {
        ...state,
        isLoading: action.isLoading
      };
    case ActionTypes.UpdateMeta:
      return {
        ...state,
        meta: action.meta
      };
    case ActionTypes.UpdateNumImagesSqrt:
      return {
        ...state,
        numImagesSqrt: action.numImagesSqrt
      };
    case ActionTypes.UpdateImgSquareSize:
      return {
        ...state,
        imgSquareSize: action.imgSquareSize
      };
    case ActionTypes.UpdateResizedImages:
      return {
        ...state,
        resizedImages: action.resizedImages
      };
    case ActionTypes.UpdateMessenger:
      return {
        ...state,
        messenger: action.messenger
      }
  }
};
