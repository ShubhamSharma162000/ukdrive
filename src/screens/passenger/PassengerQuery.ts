import Api from '../../api/Api';

export const getPassengerDetail = async (id: String) => {
  const res = await Api.get(`/passenger/getpassengerdata`, {
    params: { id },
  });
  return res.data;
};

export const getDriverReviews = async (id: String, limit: string) => {
  const res = await Api.get(`/passenger/getdriversreview`, {
    params: { id, limit },
  });
  return res.data;
};

export const postUpdateProfile = async (payload: any) => {
  const res = await Api.patch('/passenger/updateprofile', payload);
  return res.data;
};

export const getPassengerTransaction = async (id: String) => {
  const res = await Api.get(`/passenger/getpassengertransaction`, {
    params: { id },
  });
  return res.data;
};

export const getAvailableDriver = async (
  lat: number,
  lang: number,
  id: String,
) => {
  const res = await Api.get(`/passenger/getavailabledriver`, {
    params: { lat, lang, id },
  });
  return res.data;
};

export const getEstimatePrice = async (
  pickupLocation: String,
  destinationLocation: string,
  vehicle_type: string,
) => {
  const res = await Api.post(`/passenger/getEstimatePrice`, {
    pickupLocation,
    destinationLocation,
    vehicleType: vehicle_type,
  });
  return res.data;
};

export const updateRidesData = async (ridesData?: {}) => {
  const res = await Api.post(`/rides/ridesdata`, {
    ridesData,
  });
  return res.data;
};
