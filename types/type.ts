export interface ReviewPayload {
  rating: number;
  comment: string;
}

export interface RegionsModel {
  id: string;
  name: string;
  iso: string;
}

export interface LocationPayload {
    address: string;
    lat: number;
    lng: number;
  }