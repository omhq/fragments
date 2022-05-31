import keyBy from "lodash/keyBy";
import _ from "lodash";
import { ITemplate, IConnector, ICache } from "../types";

const HTTP_ERROR = "http-error";
const HTTP_FETCHING_TEMPLATES = "http-fetching-templates";
const HTTP_FETCHING_CONNECTORS = "http-fetching-connectors";

const TEMPLATE = "template";
const TEMPLATES = "templates";
const TEMPLATE_CREATED = "template-created";
const TEMPLATE_UPDATED = "template-updated";
const TEMPLATE_DELETED = "template-deleted";

const CONNECTOR = "connector";
const CONNECTORS = "connectors";
const CONNECTOR_CREATED = "connector-created";
const CONNECTOR_UPDATED = "connector-updated";
const CONNECTOR_DELETED = "connector-deleted";

const CACHE = "cache";
const LOG = "log";

const RUN_TEST = "run-test";
const RUN_DEPLOY = "run-deploy";
const RUN_UNDEPLOY = "run-undeploy";

const TESTING = "testing";
const DEPLOYING = "deploying";
const UNDEPLOYING = "undeploying";
const SAVING = "saving";

const AUTH_LOGIN_SUCCESS = "auth-login-success";
const AUTH_LOGOUT_SUCCESS = "auth-logout-success";
const AUTH_SELF = "auth-self"

export const initialState = {
  user: null,
  templates: [],
  caches: [],
  connectors: [],
  templatesById: {},
  cachesByTemplateId: {},
  logsByTemplateId: {},
  connectorsById: {},

  httpErrorMessage: "",
  httpError: false,
  httpFetching: false,

  httpFetchingTemplates: false,
  httpFetchingConnectors: false,

  // template id to operate on
  runDeploy: 0,
  runUnDeploy: 0,
  runTest: 0,

  // template id being operated on
  testing: 0,
  deploying: 0,
  undeploying: 0,
  saving: 0,
}

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case HTTP_ERROR:
      return {
        ...state,
        httpError: true,
        httpErrorMessage: action.payload.message
      }
    case HTTP_FETCHING_TEMPLATES:
      return {
        ...state,
        httpFetchingTemplates: action.payload
      }
    case HTTP_FETCHING_CONNECTORS:
      return {
        ...state,
        httpFetchingConnectors: action.payload
      }
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        user: { ...action.payload.user }
      }
    case AUTH_SELF:
      return {
        ...state,
        user: { ...action.payload }
      }
    case AUTH_LOGOUT_SUCCESS:
      return {
        ...state,
        user: null
      }
    case TEMPLATES:
      return {
        ...state,
        templates: !state.templates.length
          ? action.payload.map((template: ITemplate) => template.id)
          : [...new Set([...state.templates, ...action.payload.map((template: ITemplate) => template.id)])],
        templatesById: {
          ...state.templatesById,
          ...keyBy(action.payload, 'id')
        }
      }
    case TEMPLATE_CREATED:
      return {
        ...state,
        templates: !state.templates.length
          ? [action.payload.id]
          : [...new Set([action.payload.id, ...state.templates])],
        templatesById: {
          ...state.templatesById,
          [action.payload.id]: action.payload
        }
      }
    case TEMPLATE_UPDATED:
      return {
        ...state,
        templatesById: {
          ...state.templatesById,
          [action.payload.id]: action.payload
        }
      }
    case TEMPLATE_DELETED:
      const templatesById = state.templatesById;
      delete templatesById[action.payload];

      return {
        ...state,
        templates: _.filter(state.templates, (id) => { return id !== action.payload }),
        templatesById: { ...templatesById }
      }
    case TEMPLATE:
      return {
        ...state,
        templatesById: {
          ...state.templatesById,
          [action.payload.id]: action.payload
        }
      }
    case CONNECTORS:
      return {
        ...state,
        connectors: !state.connectors.length
          ? action.payload.map((connector: IConnector) => connector.id)
          : [...new Set([...state.connectors, ...action.payload.map((connector: IConnector) => connector.id)])],
        connectorsById: {
          ...state.connectorsById,
          ...keyBy(action.payload, 'id')
        }
      }
    case CONNECTOR_CREATED:
      return {
        ...state,
        connectors: !state.connectors.length
          ? [action.payload.id]
          : [...new Set([action.payload.id, ...state.connectors])],
        connectorsById: {
          ...state.connectorsById,
          [action.payload.id]: action.payload
        }
      }
    case CONNECTOR_UPDATED:
      return {
        ...state,
        connectorsById: {
          ...state.connectorsById,
          [action.payload.id]: action.payload
        }
      }
    case CONNECTOR_DELETED:
      const connectorsById = state.connectorsById;
      delete connectorsById[action.payload];

      return {
        ...state,
        connectors: _.filter(state.connectors, (id) => { return id !== action.payload }),
        connectorsById: { ...connectorsById }
      }
    case CONNECTOR:
      return {
        ...state,
        connectorsById: {
          ...state.connectorsById,
          [action.payload.id]: action.payload
        }
      }
    case CACHE:
      let currentCaches = state.caches;
      const existingCache = (cache: ICache) => cache.id === action.payload.id;
      const existingIndex = currentCaches.findIndex(existingCache);

      if (existingIndex !== -1) {
        currentCaches[existingIndex] = action.payload;
      } else {
        currentCaches.push(action.payload);
      }

      return {
        ...state,
        cachesByTemplateId: {
          ...state.cachesByTemplateId,
          [action.payload.template_id]: action.payload
        },
        caches: [...currentCaches]
      }
    case LOG:
      return {
        ...state,
        logsByTemplateId: {
          ...state.logsByTemplateId,
          [action.payload.template_id]: action.payload
        }
      }
    case RUN_TEST:
      return {
        ...state,
        runTest: action.payload
      }
    case RUN_DEPLOY:
      return {
        ...state,
        runDeploy: action.payload
      }
    case RUN_UNDEPLOY:
      return {
        ...state,
        runUnDeploy: action.payload
      }
    case TESTING:
      return {
        ...state,
        testing: action.payload
      }
    case DEPLOYING:
      return {
        ...state,
        deploying: action.payload
      }
    case UNDEPLOYING:
      return {
        ...state,
        undeploying: action.payload
      }
    case SAVING:
      return {
        ...state,
        saving: action.payload
      }
    default:
      throw new Error()
  }
}

export const setCache = (data: any) => ({
  type: CACHE,
  payload: data
});

export const setLog = (data: any) => ({
  type: LOG,
  payload: data
});

export const getTemplate = (data: any) => ({
  type: TEMPLATE,
  payload: data
});

export const getTemplates = (data: any) => ({
  type: TEMPLATES,
  payload: data?.results || []
});

export const templateCreated = (data: any) => ({
  type: TEMPLATE_CREATED,
  payload: data
});

export const templateUpdated = (data: any) => ({
  type: TEMPLATE_UPDATED,
  payload: data
});

export const templateDeleted = (id: number) => ({
  type: TEMPLATE_DELETED,
  payload: id
});

export const getConnector = (data: any) => ({
  type: CONNECTOR,
  payload: data
});

export const getConnectors = (data: any) => ({
  type: CONNECTORS,
  payload: data?.results || []
});

export const connectorCreated = (data: any) => ({
  type: CONNECTOR_CREATED,
  payload: data
});

export const connectorUpdated = (data: any) => ({
  type: CONNECTOR_UPDATED,
  payload: data
});

export const connectorDeleted = (id: number) => ({
  type: CONNECTOR_DELETED,
  payload: id
});

export const httpError = (message: string) => ({
  type: HTTP_ERROR,
  payload: {
    message: message
  }
});

export const httpFetchTemplates = (bool: boolean) => ({
  type: HTTP_FETCHING_TEMPLATES,
  payload: bool
});

export const httpFetchConnectors = (bool: boolean) => ({
  type: HTTP_FETCHING_CONNECTORS,
  payload: bool
});

export const runTest = (templateId: number) => ({
  type: RUN_TEST,
  payload: templateId
});

export const runDeploy = (templateId: number) => ({
  type: RUN_DEPLOY,
  payload: templateId
});

export const runUnDeploy = (templateId: number) => ({
  type: RUN_UNDEPLOY,
  payload: templateId
});

export const setTesting = (templateId: number) => ({
  type: TESTING,
  payload: templateId
});

export const setDeploying = (templateId: number) => ({
  type: DEPLOYING,
  payload: templateId
});

export const setUnDeploying = (templateId: number) => ({
  type: UNDEPLOYING,
  payload: templateId
});

export const setSaving = (templateId: number) => ({
  type: SAVING,
  payload: templateId
});

export const authLoginSuccess = (data: any) => ({
  type: AUTH_LOGIN_SUCCESS,
  payload: data
});

export const authLogoutSuccess = () => ({
  type: AUTH_LOGOUT_SUCCESS,
});

export const authSelf = (data: any) => ({
  type: AUTH_SELF,
  payload: data
});
