import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MenuAlt2Icon } from "@heroicons/react/outline";
import { CONNECTORS_FETCH_LIMIT } from "../../../constants";
import { IConnector } from "../../../types";
import { checkHttpStatus } from "../../../utils/api/helpers";
import { connectorsHttpGet } from "../../../utils/api/connectors";
import { getConnectors, httpFetchConnectors } from "../../../reducers/main";
import { toaster } from "../../../utils/utils";
import Spinner from "../../../components/global/Spinner";
import Pagination from "../../../components/global/Pagination";
import Search from "../../../components/global/Search";
import PreviewBlock from "../PreviewBlock";
import SideBar from "../../../components/global/SideBar";
import DarkModeSwitch from "../../../components/global/DarkModeSwitch";

interface IConnectorsProps {
  dispatch: any;
  state: any;
}

const Connectors = (props: IConnectorsProps) => {
  const { dispatch, state } = props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [connectors, setConnectors] = useState<Array<number>>();
  const [total, setTotal] = useState(0);
  const [offset, setoffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const handleChange = () => {
    if (hasMore) {
      setoffset((offset + CONNECTORS_FETCH_LIMIT));
    }
  };

  const onSearchChange = (e: any) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    dispatch(httpFetchConnectors(true));
    connectorsHttpGet(offset)
      .then(checkHttpStatus)
      .then(data => {
        dispatch(getConnectors(data));
        setHasMore(Boolean(data?.next));
        setTotal(data.count);
      })
      .catch(e => {
        if (e.status === 404) {
        } else {
          e.text().then((e: string) => {
            toaster(e, "error");
          });
        }
      })
      .finally(() => {
        dispatch(httpFetchConnectors(false));
      })
  }, [dispatch, offset]);

  useEffect(() => {
    setConnectors(state.connectors);
  }, [state.connectors])

  useEffect(() => {
    const _templates = [];

    for (let key in state.connectorsById) {
      let value: IConnector = state.connectorsById[key];
      if (value.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
        _templates.push(value.id);
      }
    }

    setConnectors(_templates);
  }, [filter, state.connectorsById]);

  return (
    <>
      <SideBar state={state} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="md:pl-56 flex flex-col flex-1">
        <div className="dark:bg-gray-800 sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r dark:border-gray-900 border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 sm:px-6 md:px-8 flex justify-between">
            <Search onSearchChange={onSearchChange} />

            <div className="ml-4 flex items-center md:ml-6">
              <DarkModeSwitch />
            </div>
          </div>
        </div>

        <main>
          <div className="py-6">
            <div className="flex justify-between px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold dark:text-white text-gray-900">Connectors</h1>

              <Link
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                to="/connectors/new"
              >
                <span className="text-sm">New</span>
              </Link>
            </div>

            <div className="px-4 sm:px-6 md:px-8">
              {state.httpFetchingConnectors &&
                <div className="flex justify-center items-center mx-auto mt-10">
                  <Spinner className="w-6 h-6 text-blue-600" />
                </div>
              }

              {!state.httpFetchingConnectors &&
                <div className="py-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(connectors && connectors.length > 0) &&
                      connectors.map((id: number, index: number) => {
                        const connectorObj: IConnector = state.connectorsById[id];

                        if (connectorObj) {
                          return (
                            <div key={`${index}`}>
                              <PreviewBlock
                                dispatch={dispatch}
                                data={connectorObj}
                              />
                            </div>
                          )
                        }

                        return null;
                      })
                    }
                  </div>

                  {hasMore &&
                    <Pagination
                      defaultCurrent={state.connectors.length}
                      defaultPageSize={CONNECTORS_FETCH_LIMIT}
                      onChange={handleChange}
                      total={total}
                      loading={state.httpFetchingConnectors}
                    />
                  }

                  {(!state.httpFetchingConnectors && state.connectors.length === 0) &&
                    <div className="text-center">
                      <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Nothing here</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a connector.</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Connectors;
