import Api from '../../api/Api';

export const getDriversDetails = async (id: String) => {
  const res = await Api.get(`/driver/getdriverdata`, {
    params: { id },
  });
  console.log('routes here ');
  return res.data;
};

export const getEarningDetails = async (
  id: String,
  range: string,
  type: string,
) => {
  const res = await Api.get(`/driver/getdriverearning`, {
    params: { id, range, type },
  });
  return res.data;
};

export const getDriversTripDetails = async (id: string, period: string) => {
  const res = await Api.get(`/driver/getdriverTripsdata`, {
    params: { id, period },
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
  const res = await Api.get('/driver/driver-wallet-transactions', {
    params: { id },
  });
  return res.data.data;
};

// export const getDriverGps = async (id: string) => {
//   const res = await Api.get('/driver/getdrivergps', {
//     params: { id },
//   });
//   return res.data;
// };
