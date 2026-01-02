import Api from '../../api/Api';

export const getHistoryDetails = async (id: String) => {
  const res = await Api.get(`/driver/dashboard/getdriverhistory`, {
    params: { id },
  });
  return res.data;
};
