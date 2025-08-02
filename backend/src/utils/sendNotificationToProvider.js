import axios from "axios";
import ServiceProvider from "../models/serviceProvider.model.js";

const sendNotificationToProvider = async (providerId, { title, body }) => {
  const provider = await ServiceProvider.findById(providerId);
  if (!provider?.expoPushToken) return;

  await axios.post("https://exp.host/--/api/v2/push/send", {
    to: provider.expoPushToken,
    title,
    body,
  });
};

export default sendNotificationToProvider;
