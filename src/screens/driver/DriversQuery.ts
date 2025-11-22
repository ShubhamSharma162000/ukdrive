import Api from '../../api/Api';

export const getDriversDetails = async (id: String) => {
  const res = await Api.get(`/driver/getdriverdata`, {
    params: { id },
  });
  console.log('routes here ');
  return res.data;
};

export const getDriversTripDetails = async (
  id: string,
  duration: string,
  rideStatus: string,
) => {
  console.log('routes comes here');
  const res = await Api.get(`/driver/getdriverTripdata`, {
    params: { id, duration, rideStatus },
  });
  return res.data;
};
export const getDriversId = async () => {
  const res = await Api.get(`/driver/getdriverIds`);
  return res.data;
};

export const getWalletData = async (id: string) => {
  const res = await Api.get('/driver/getdriverwalletdata', {
    params: { id },
  });
  return res.data;
};

export const getRideInfo = async (rideId: string) => {
  const res = await Api.get('/driver/getrideinfo', {
    params: { rideId },
  });
  return res.data;
};

export const getDriverTransactions = async (id: string) => {
  const res = await Api.get('/driver/transactions', {
    params: { id },
  });
  return res.data;
};

// export const getDriverGps = async (id: string) => {
//   const res = await Api.get('/driver/getdrivergps', {
//     params: { id },
//   });
//   return res.data;
// };
