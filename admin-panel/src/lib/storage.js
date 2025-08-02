export const getToken = () => (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);
export const setToken = (token) => {
  if (typeof localStorage !== "undefined") {
	localStorage.setItem("token", token);
  }
};
export const removeToken = () => {
  if (typeof localStorage !== "undefined") {
	localStorage.removeItem("token");
  }
};
