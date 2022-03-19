import { Action, ActionTypes } from "./actions";
import { AppState } from "./store";

export const appReducer = (state: AppState, action: Action): AppState => {
  // For every state change that didn't come from the messenger and
  // isn't about updating the messenger itself, send a message
  if (state.messenger && action.type !== ActionTypes.UpdateMessenger) {
    const message = action as any;
    if (!message.sessionId && !message.timestamp) {
      console.debug("Sending action message", action);
      state.messenger.send(action);
    }
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
