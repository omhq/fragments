import { ITemplateUpdatePayload, ITemplateCreatePayload } from "../../types";
import { API_SERVER_URL, TEMPLATES_FETCH_LIMIT } from "../../constants";
import { getLocalStorageJWTKeys } from "./utils";


export const templateHttpCreate = (data: ITemplateCreatePayload) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/templates/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    },
    body: JSON.stringify(data)
  });
}

export const templateHttpDeploy = (id: number, runInBackground: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let url = `${API_SERVER_URL}/templates/deploy/${id}/?runInBackground=${runInBackground}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  })
};

export const templateHttpUnDeploy = (id: number, stage: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let url = `${API_SERVER_URL}/templates/undeploy/${id}/${stage}/`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  })
};

export const templateHttpTest = (id: number, runInBackground: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let url = `${API_SERVER_URL}/templates/test/${id}/?runInBackground=${runInBackground}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  })
};

export const templateHttpTestResults = (id: number, stage: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let url = `${API_SERVER_URL}/templates/test/results/${id}/${stage}/`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  })
};

export const templateHttpUpdate = (id: number, data: ITemplateUpdatePayload) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let url = `${API_SERVER_URL}/templates/${id}/`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    },
    body: JSON.stringify(data)
  })
};

export const templateHttpDelete = (id: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/templates/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}

export const templatesHttpGet = (offset: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  let endpoint = `${API_SERVER_URL}/templates/?limit=${TEMPLATES_FETCH_LIMIT}&offset=${offset}`;

  return fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}

export const templateHttpGet = (id: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/templates/${id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}

export const cacheHttpGetByTemplateId = (template_id: number, stage: number) => {
  const jwtKeys = getLocalStorageJWTKeys();
  return fetch(`${API_SERVER_URL}/caches/?template_id=${template_id}&stage=${stage}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtKeys.access_token}`
    }
  });
}