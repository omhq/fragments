import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";
import { toaster } from "../../../utils/utils";
import { ITemplate, ICache, ITemplateUpdatePayload } from "../../../types";
import { API_SERVER_URL, PING_INTERVAL_MS } from "../../../constants";
import { checkHttpStatus } from "../../../utils/api/helpers";
import {
  cacheHttpGetByTemplateId,
  templateHttpGet,
  templateHttpUpdate,
  templateHttpTest,
  templateHttpTestResults,
  templateHttpDeploy,
  templateHttpUnDeploy
} from "../../../utils/api/templates";
import {
  setCache,
  getConnector,
  templateUpdated,
  runTest,
  setTesting,
  setDeploying,
  setUnDeploying,
  runDeploy,
  runUnDeploy,
  setSaving,
  setLog
} from "../../../reducers/main";
import Spinner from "../../../components/global/Spinner";
import SideBar from "../../../components/global/SideBar";
import Header from "./Header";
import CodeEditor from "../../../components/global/CodeEditor";
import ActionsDropDown from "./ActionsDropDown";
import Logs from "./Logs";

interface ITemplateEditProps {
  dispatch: any;
  state: any;
}

const TemplateEdit = (props: ITemplateEditProps) => {
  const { id } = useParams<{ id?: string }>();
  const { dispatch, state } = props;
  const [prodCache, setProdCache] = useState<ICache | null>(null);
  const [fetching, setFetching] = useState(false);
  const [template, setTemplate] = useState<ITemplate>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const getCache = useCallback((templateId: number, stage: number) => {
    return state.caches.find((cache: ICache) => {
      return (cache.template_id === templateId && cache.stage === stage);
    })
  }, [state.caches]);

  const handleError = useCallback((err: any) => {
    if (err.status === 404) {
      toaster("object not found", "error");
      navigate("/");
    } else {
      err.text().then((e: string) => {
        toaster(e, "error");
      })
    }
  }, [navigate]);

  const onCodeChange = (e: any) => {
    const obj = { ...template } as ITemplate;
    obj.code = e;
    setTemplate(obj);
  };

  const onNameChange = (e: any) => {
    const nameValue = e.target.value;
    const obj = { ...template } as ITemplate;
    obj.name = nameValue;
    setTemplate(obj);
  };

  const onSave = () => {
    if (id) {
      const templateId = parseInt(id);
      const updatePayload: ITemplateUpdatePayload = {
        "name": (template?.name || "Untitled"),
        "code": (template?.code || "")
      }
      dispatch(setSaving(templateId));
      templateHttpUpdate(templateId, updatePayload)
        .then(checkHttpStatus)
        .then(data => {
          dispatch(templateUpdated(data));
          toaster("saved", "success");
        })
        .catch(err => {
          handleError(err);
        })
        .finally(() => {
          dispatch(setSaving(0));
        })
    }
  };

  const httpFetchTestResults = useCallback((templateId: number, stage: number) => {
    templateHttpTestResults(templateId, stage)
      .then(checkHttpStatus)
      .then(data => {
        if (Object.keys(data.results).length) {
          dispatch(setLog({
            template_id: templateId,
            cache: data.cache,
            results: data.results
          }));
        }
      })
      .catch(err => {
        handleError(err);
      })
  }, [dispatch, handleError])

  const httpFetchCacheObject = useCallback((templateId: number, stage: number) => {
    cacheHttpGetByTemplateId(templateId, stage)
      .then(checkHttpStatus)
      .then(data => {
        dispatch(setCache(data));
      })
      .catch(err => {
        handleError(err);
      })
      .finally(() => {
        setFetching(false);
      })
  }, [dispatch, handleError]);

  useEffect(() => {
    if (id) {
      const templateId = parseInt(id);
      const templateObj: ITemplate = state.templatesById[templateId];

      if (templateObj) {
        setTemplate(templateObj);
      } else {
        setFetching(true);
        templateHttpGet(templateId)
          .then(checkHttpStatus)
          .then(data => {
            dispatch(getConnector(data));
            setTemplate(data);
          })
          .catch(err => {
            handleError(err);
          })
          .finally(() => {
            setFetching(false);
          })
      }
    }
  }, [id, dispatch, state.templatesById, handleError]);

  // fetch logs of a cache if it is not in running state
  useEffect(() => {
    if (id) {
      const templateId = parseInt(id);
      const cache = state.cachesByTemplateId[templateId];

      if (cache && cache.task_status !== 3) {
        if (cache.stage === 0) {
          httpFetchTestResults(templateId, cache.stage);
        }

        if (cache.stage === 1) {
          httpFetchTestResults(templateId, cache.stage);
        }
      }
    }
  }, [id, state.cachesByTemplateId, httpFetchTestResults, dispatch]);

  // run deploy
  useEffect(() => {
    if (id && state.runDeploy) {
      const templateId = parseInt(id);

      if (templateId === state.runDeploy) {
        dispatch(runDeploy(0));

        templateHttpDeploy(templateId, 1)
          .then(checkHttpStatus)
          .then(data => {
            dispatch(setCache(data.cache));
            dispatch(setDeploying(templateId));
          })
          .catch(err => {
            handleError(err);
          })
      }
    }
  }, [id, state.runDeploy, dispatch, handleError]);

  // run undeploy
  useEffect(() => {
    if (prodCache && state.runUnDeploy) {
      if (prodCache.template_id === state.runUnDeploy) {
        dispatch(runUnDeploy(0));

        templateHttpUnDeploy(prodCache.template_id, 1)
          .then(checkHttpStatus)
          .then(data => {
            dispatch(setCache(data));
            dispatch(setUnDeploying(0));
            toaster("undeployed", "success");
          })
          .catch(err => {
            handleError(err);
          })
      }
    }
  }, [id, prodCache, state.runUnDeploy, dispatch, handleError]);

  // run test
  useEffect(() => {
    if (id && state.runTest) {
      const templateId = parseInt(id);

      if (templateId === state.runTest) {
        dispatch(runTest(0));

        templateHttpTest(templateId, 1)
          .then(checkHttpStatus)
          .then(data => {
            dispatch(setCache(data.cache));
            dispatch(setTesting(templateId));
          })
          .catch(err => {
            handleError(err);
          })
      }
    }
  }, [id, state.runTest, dispatch, handleError]);

  // periodic ping to check test status
  useEffect(() => {
    let interval: any;
    if (id) {
      const templateId = parseInt(id);
      const cache = state.cachesByTemplateId[templateId];

      if (templateId === state.testing) {
        if (cache.task_status === 3) {
          interval = setInterval(() => {
            httpFetchCacheObject(templateId, 0);
          }, PING_INTERVAL_MS);
        } else {
          dispatch(setTesting(0));
          toaster("test completed", "success");
        }

        return () => clearInterval(interval);
      }
    }
  }, [id, dispatch, state.testing, state.cachesByTemplateId, httpFetchCacheObject]);

  // periodic ping to check deploy status
  useEffect(() => {
    let interval: any;
    if (id) {
      const templateId = parseInt(id);
      const cache = state.cachesByTemplateId[templateId];

      if (templateId === state.deploying) {
        if (cache.task_status === 3) {
          interval = setInterval(() => {
            httpFetchCacheObject(templateId, 1);
          }, PING_INTERVAL_MS);
        } else {
          dispatch(setDeploying(0));
          toaster("deployed", "success");
        }

        return () => clearInterval(interval);
      }
    }
  }, [id, dispatch, state.deploying, state.cachesByTemplateId, httpFetchCacheObject]);

  // fetch the last test logs
  useEffect(() => {
    if (id) {
      const templateId = parseInt(id);
      httpFetchTestResults(templateId, 0);
    }
  }, [id, httpFetchTestResults]);

  // get prod cache from state, or http fetch it
  useEffect(() => {
    if (id) {
      const templateId = parseInt(id);
      const prodCache = getCache(templateId, 1);

      if (prodCache) {
        setProdCache(prodCache);
      } else {
        httpFetchCacheObject(templateId, 1);
      }
    }
  }, [getCache, httpFetchCacheObject, id]);

  return (
    <>
      <SideBar state={state} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="md:pl-56 flex flex-col flex-1">
        <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

        <main className="py-6">
          {(fetching) &&
            <div className="flex justify-center items-center mx-auto mt-10">
              <Spinner className="w-6 h-6 text-blue-600" />
            </div>
          }

          {(!fetching) &&
            <>
              <div className="flex flex-col-reverse items-center justify-between px-4 sm:px-6 lg:flex-row md:px-8">
                {template &&
                  <input
                    className={`
                      bg-gray-100
                      dark:bg-gray-900
                      appearance-none
                      w-full
                      lg:w-3/4
                      block
                      text-gray-700
                      dark:text-white
                      border
                      border-gray-100
                      dark:border-gray-900
                      rounded
                      py-2
                      px-3
                      leading-tight
                      focus:outline-none
                      focus:border-indigo-400
                      focus:ring-0
                    `}
                    id="grid-first-name"
                    type="text"
                    placeholder="Untitled"
                    value={template.name}
                    autoComplete="off"
                    onChange={(e: any) => onNameChange(e)}
                  />
                }

                <div className="flex flex-col space-y-2 w-full justify-end mb-4  md:flex-row md:space-y-0 md:space-x-2 lg:mb-0">
                  {(prodCache && prodCache.public === 1) &&
                    <button
                      onClick={() => {
                        window.open(`${API_SERVER_URL}/view/${id}/`, '_blank');
                      }}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:w-auto text-sm"
                    >
                      <div className="flex justify-center items-center space-x-2">
                        <ExternalLinkIcon className="w-4 h-4" />
                        <span>Public URL</span>
                      </div>
                    </button>
                  }

                  <button
                    onClick={() => onSave()}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:w-auto text-sm"
                  >
                    <div className="flex justify-center items-center space-x-2">
                      {(state.saving !== 0) &&
                        <Spinner className="w-5 h-5 text-blue-300" />
                      }
                      <span>Save</span>
                    </div>
                  </button>

                  {id &&
                    <ActionsDropDown
                      dispatch={dispatch}
                      state={state}
                      prodCache={prodCache}
                      templateId={parseInt(id)}
                    />
                  }
                </div>
              </div>

              <div className="px-4 sm:px-6 md:px-8 mt-4">
                {template &&
                  <div className="text-center sm:text-left">
                    <div className={`max-h-96 overflow-y-auto`}>
                      <CodeEditor
                        data={template.code}
                        language={"python"}
                        onChange={(e: any) => onCodeChange(e)}
                        disabled={false}
                      />
                    </div>
                  </div>
                }
              </div>

              {id &&
                <Logs
                  state={state}
                  templateId={parseInt(id)}
                />
              }
            </>
          }
        </main>
      </div>
    </>
  )
}

export default TemplateEdit;
