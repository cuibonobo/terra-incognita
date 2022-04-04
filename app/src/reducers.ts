import { Action, ActionTypes } from "./actions";
import { AppState } from "./store";

const isSessionAction = (action: Action): boolean => {
  return action.type === ActionTypes.UpdateMessenger ||
    action.type === ActionTypes.UpdateResizedImages ||
    action.type === ActionTypes.UpdateLoadingStatus ||
    action.type === ActionTypes.UpdateAlerts ||
    action.type === ActionTypes.AddAlert;
};

const isReceivedAction = (action: Action): boolean => {
  return !!action.sessionId || !!action.timestamp;
};

export const appReducer = (state: AppState, action: Action): AppState => {
  // For every state change that didn't come from the messenger and
  // isn't about updating session-specific data, send a message
  if (state.messenger && !isReceivedAction(action) && !isSessionAction(action)) {
    console.debug("Sending action message", action);
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
    case ActionTypes.UpdateImgArray:
      return {
        ...state,
        imgArray: action.imgArray
      }
    case ActionTypes.UpdateResizedImages:
      return {
        ...state,
        resizedImages: action.resizedImages
      }
    case ActionTypes.UpdateMessenger:
      return {
        ...state,
        messenger: action.messenger
      }
    case ActionTypes.UpdateAlerts:
      return {
        ...state,
        alerts: action.alerts
      }
    case ActionTypes.AddAlert:
      return {
        ...state,
        alerts: [...state.alerts, action.alert]
      }
  }
};
