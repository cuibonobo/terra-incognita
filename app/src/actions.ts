import { Meta } from "../../shared"

export enum ActionTypes {
  UpdateLoadingStatus,
  UpdateMeta,
  UpdateNumImagesSqrt,
  UpdateImgSquareSize,
  UpdateResizedImages
}

interface UpdateLoadingStatus {
  type: ActionTypes.UpdateLoadingStatus,
  isLoading: boolean
}
interface UpdateMeta {
  type: ActionTypes.UpdateMeta,
  meta: Meta
}
interface UpdateNumImagesSqrt {
  type: ActionTypes.UpdateNumImagesSqrt,
  numImagesSqrt: number
}
interface UpdateImgSquareSize {
  type: ActionTypes.UpdateImgSquareSize,
  imgSquareSize: number
}
interface UpdateResizedImages {
  type: ActionTypes.UpdateResizedImages,
  resizedImages: string[]
}

export type Action = UpdateLoadingStatus | UpdateMeta | UpdateNumImagesSqrt | UpdateImgSquareSize | UpdateResizedImages;
