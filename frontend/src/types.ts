export interface Payload {
  text: string;
}

export interface ITemplate {
  id: number;
  name: string;
  code: string;
  created_at: string;
  modified_at: string;
}

export interface ITemplateNew {
  name: string;
  code: string;
}

export interface ITemplateUpdatePayload {
  name: string;
  code: string;
}

export interface ITemplateCreatePayload {
  name: string;
  code: string;
}

export interface IConnector {
  id: number;
  name: string;
  data: string;
  created_at: string;
  modified_at: string;
}

export interface IConnectorNew {
  name: string;
  data: string;
}

export interface IConnectorUpdatePayload {
  name: string;
  data: string;
}

export interface IConnectorCreatePayload {
  name: string;
  data: string;
}

export interface ICache {
  id: number;
  uuid: string;
  path: string;
  public: number;
  stage: number;
  storage: number;
  task_id: string;
  task_status: number;
  template_id: number;
  created_at: string;
  updated_at: string;
}
