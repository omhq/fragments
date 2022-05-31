import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { MenuAlt2Icon, ReplyIcon } from "@heroicons/react/outline";
import { IConnector, IConnectorUpdatePayload } from "../../../types";
import { checkHttpStatus } from "../../../utils/api/helpers";
import { connectorHttpGet, connectorHttpUpdate } from "../../../utils/api/connectors";
import { getConnector, connectorUpdated } from "../../../reducers/main";
import { toaster } from "../../../utils/utils";
import Spinner from "../../../components/global/Spinner";
import SideBar from "../../../components/global/SideBar";
import DarkModeSwitch from "../../../components/global/DarkModeSwitch";
import CodeEditor from "../../../components/global/CodeEditor";

interface IConnectorEditProps {
  dispatch: any;
  state: any;
}

const ConnectorEdit = (props: IConnectorEditProps) => {
  const { id } = useParams();
  const { dispatch, state } = props;
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [connector, setConnector] = useState<IConnector>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const onCodeChange = (e: any) => {
    const obj = { ...connector } as IConnector;
    obj.data = e;
    setConnector(obj);
  };

  const onNameChange = (e: any) => {
    const nameValue = e.target.value;
    const obj = { ...connector } as IConnector;
    obj.name = nameValue;
    setConnector(obj);
  };

  const onSave = () => {
    if (id) {
      const updatePayload: IConnectorUpdatePayload = {
        "name": (connector?.name || "Untitled"),
        "data": (connector?.data || "")
      }
      setSaving(true);
      connectorHttpUpdate(parseInt(id), updatePayload)
        .then(checkHttpStatus)
        .then(data => {
          dispatch(connectorUpdated(data));
          toaster("saved", "success");
        })
        .catch(err => {
          err.text().then((e: string) => {
            toaster(e, "error");
          });
        })
        .finally(() => {
          setSaving(false);
        })
    }
  };

  useEffect(() => {
    if (id) {
      const obj: IConnector = state.connectorsById[id];

      if (obj) {
        setConnector(obj);
      } else {
        setFetching(true);
        connectorHttpGet(parseInt(id))
          .then(checkHttpStatus)
          .then(data => {
            dispatch(getConnector(data));
            setConnector(data);
          })
          .catch(err => {
            if (err.status === 404) {
              navigate("/connectors/");
            } else {
              err.text().then((e: string) => {
                toaster(e, "error");
              });
            }
          })
          .finally(() => {
            setFetching(false);
          })
      }
    }
  }, [dispatch, id, navigate, state.connectorsById]);

  return (
    <>
      <SideBar state={state} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="md:pl-56 flex flex-col flex-1">
        <>
          <div className="dark:bg-gray-800 sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              type="button"
              className="px-4 border-r dark:border-gray-900 border-gray-200 text-gray-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 px-4 sm:px-6 md:px-8 flex justify-between items-center">
              <Link
                className="text-gray-700 dark:text-white"
                to="/connectors"
              >
                <ReplyIcon className="w-4 h-4" />
              </Link>

              <div className="ml-4 flex md:ml-6">
                <DarkModeSwitch />
              </div>
            </div>
          </div>

          <main className="py-6">
            {(fetching) &&
              <div className="flex justify-center items-center mx-auto mt-10">
                <Spinner className="w-6 h-6 text-blue-600" />
              </div>
            }

            {(!fetching) &&
              <>
                <div className="flex flex-col-reverse items-center justify-between px-4 sm:px-6 md:flex-row md:px-8">
                  {connector &&
                    <input
                      className={`
                        bg-gray-100
                        dark:bg-gray-900
                        appearance-none
                        w-full
                        md:w-3/4
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
                      value={connector.name}
                      autoComplete="off"
                      onChange={(e: any) => onNameChange(e)}
                    />
                  }

                  <div className="flex flex-col space-y-2 w-full justify-end mb-4  md:flex-row md:space-y-0 md:space-x-2 md:mb-0">
                    <button
                      onClick={() => onSave()}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:w-auto text-sm"
                    >
                      <div className="flex justify-center items-center space-x-2">
                        {saving &&
                          <Spinner className="w-5 h-5 text-green-300" />
                        }
                        <span>Save</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="px-4 sm:px-6 md:px-8 mt-4">
                  {connector &&
                    <div className="text-center sm:text-left">
                      <div className={`max-h-96 overflow-y-auto`}>
                        <CodeEditor
                          data={connector.data ? connector.data : ""}
                          language={"json"}
                          onChange={(e: any) => onCodeChange(e)}
                          disabled={false}
                        />
                      </div>
                    </div>
                  }
                </div>
              </>
            }
          </main>
        </>
      </div>
    </>
  )
}

export default ConnectorEdit;
