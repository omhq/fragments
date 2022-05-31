import { IConnectorUpdatePayload, IConnectorCreatePayload } from "../../types";
import { API_SERVER_URL, CONNECTORS_FETCH_LIMIT } from "../../constants";
import { getLocalStorageJWTKeys } from "./utils";


export const connectorHttpCreate = (data: IConnectorCreatePayload) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/connectors/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    },
    body: JSON.stringify(data)
  });
}

export const connectorHttpUpdate = (id: number, data: IConnectorUpdatePayload) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/connectors/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    },
    body: JSON.stringify(data)
  });
}

export const connectorHttpDelete = (id: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/connectors/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}

export const connectorsHttpGet = (offset: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let endpoint = `${API_SERVER_URL}/connectors/?limit=${CONNECTORS_FETCH_LIMIT}&offset=${offset}`;

  return fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}

export const connectorHttpGet = (id: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/connectors/${id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}
