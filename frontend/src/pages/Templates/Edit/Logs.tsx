import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import { Tab } from "@headlessui/react";
import { truncateStr } from "../../../utils/utils";
import CodeEditor from "../../../components/global/CodeEditor";


interface IReadOnlyCodeBlockProps {
  str: string;
  lang: string;
}

interface ILogsProps {
  state: any;
  templateId: number;
}

interface ITestResultProps {
  cache: any;
  results: any;
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const ReadOnlyCodeBlock = (props: IReadOnlyCodeBlockProps) => {
  const { str, lang } = props;

  return (
    <Tab.Panel>
      <CodeEditor
        data={str}
        language={lang}
        onChange={(e: any) => { }}
        disabled={true}
        lineWrapping={true}
      />
    </Tab.Panel>
  )
}

const Logs = (props: ILogsProps) => {
  let query = useQuery();
  const { state, templateId } = props;
  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState<ITestResultProps | null>(null);
  const [tabs, setTabs] = useState<Array<string>>([]);
  const [, setSearchParams] = useSearchParams();

  const changeTabIndex = (index: number) => {
    const tabName = tabs[index];
    setSearchParams({ tab: tabName });
  }

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop();
    return ext ? ext : "";
  }

  const getFileLang = (filename: string): string => {
    const ext = getFileExtension(filename);
    switch (ext) {
      case "sql":
        return "sql";
      case "errors":
        return "";
      case "raw":
        return "json";
      case "latest":
        return "json";
      default:
        return "";
    }
  }

  const prepareData = (str: string, filename: string): string => {
    const ext = getFileExtension(filename);

    if (ext === "raw") {
      return str.slice(1, -1)
    }

    return str;
  }

  useEffect(() => {
    if (testResults && testResults.results) {
      const tabQueryParam = query.get('tab');
      const _tabs = Object.keys(testResults.results).map((key) => key);

      if (tabQueryParam && _tabs.length) {
        const tabIndex = _tabs.indexOf(tabQueryParam);
        if (tabIndex !== -1) {
          setActiveTab(tabIndex);
        }
      }

      setTabs(_tabs);
    } else {
      setTabs([]);
      setActiveTab(0);
    }
  }, [testResults, query]);

  useEffect(() => {
    setTestResults(null);
    setTabs([]);

    if (templateId) {
      const currentLogs = state.logsByTemplateId[templateId];
      if (currentLogs) {
        setTestResults({
          cache: currentLogs.cache,
          results: currentLogs.results
        });
      }
    }
  }, [templateId, state.logsByTemplateId]);

  return (
    <div className="px-4 sm:px-6 md:px-8 mt-4">
      {testResults?.results &&
        <>
          <Tab.Group
            onChange={(index: number) => {
              changeTabIndex(index);
            }}
            defaultIndex={activeTab}
            manual
          >
            <div className="flex justify-between mb-2 flex-row md:items-center overflow-x-auto">
              <Tab.List className="flex p-1 space-x-1">
                {tabs.map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }: { selected: boolean }) =>
                      classNames(
                        'w-full py-2 px-5 text-sm leading-5 font-medium',
                        'focus:outline-none',
                        selected
                          ? 'dark:text-white text-gray-700 border-b-2'
                          : 'dark:text-gray-400 dark:hover:text-gray-300 text-gray-700 hover:text-gray-800 border-b-2 dark:border-gray-800 border-white'
                      )
                    }
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className="inline-block align-middle">{truncateStr(tab, 10)}</span>

                      {(tab === "raw" && !testResults.results?.errors) &&
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      }

                      {(tab === "errors") &&
                        <XCircleIcon className="w-4 h-4 text-red-400" />
                      }
                    </div>
                  </Tab>
                ))}
              </Tab.List>
            </div>

            <Tab.Panels className="mt-2">
              {tabs.map((tab) => (
                <div key={tab}>
                  {(testResults && testResults.results[tab]) &&
                    <ReadOnlyCodeBlock str={prepareData(testResults.results[tab], tab)} lang={getFileLang(tab)} />
                  }
                </div>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </>
      }
    </div>
  )
}

export default Logs;
