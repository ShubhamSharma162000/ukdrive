import Api from '../api/Api';

export const enableLocationSharing = async (id: String) => {
  const res = await Api.patch(`/drivers/${id}`, {
    isGPSSharing: true,
    isAvailable: true,
  });

  return res.data;
};
