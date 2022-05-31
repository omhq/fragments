import { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { MenuAlt2Icon, ReplyIcon } from "@heroicons/react/outline";
import { ITemplateCreatePayload } from "../../../types";
import { checkHttpStatus } from "../../../utils/api/helpers";
import { templateHttpCreate } from "../../../utils/api/templates";
import { templateCreated } from "../../../reducers/main";
import { toaster } from "../../../utils/utils";
import Spinner from "../../../components/global/Spinner";
import SideBar from "../../../components/global/SideBar";
import DarkModeSwitch from "../../../components/global/DarkModeSwitch";
import CodeEditor from "../../../components/global/CodeEditor";

interface ITemplateNewProps {
  state: any;
  dispatch: any;
}

const TemplateNew = (props: ITemplateNewProps) => {
  const { state, dispatch } = props;
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: 'Untitled',
      code: ''
    },
    onSubmit: values => {
      onCreate(values);
    }
  });

  const onCreate = (payload: ITemplateCreatePayload) => {
    setCreating(true);
    templateHttpCreate(payload)
      .then(checkHttpStatus)
      .then(data => {
        dispatch(templateCreated(data));
        navigate(`/templates/${data.id}`);
        toaster("created", "success");
      })
      .catch(err => {
        err.text().then((e: string) => {
          toaster(e, "error");
        })
      })
      .finally(() => {
        setCreating(false);
      })
  };

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
          <div className="flex-1 px-4 sm:px-6 md:px-8 flex justify-between items-center">
            <Link
              className="text-gray-700 dark:text-white"
              to="/"
            >
              <ReplyIcon className="w-4 h-4" />
            </Link>

            <div className="ml-4 flex md:ml-6">
              <DarkModeSwitch />
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="flex flex-col-reverse items-center justify-between px-4 sm:px-6 md:flex-row md:px-8">
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
              type="text"
              placeholder="Untitled"
              autoComplete="off"
              id="name"
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
            />

            <div className="flex flex-col space-y-2 w-full justify-end mb-4  md:flex-row md:space-y-0 md:space-x-2 md:mb-0">
              <button
                onClick={() => formik.handleSubmit()}
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:w-auto text-sm"
              >
                <div className="flex justify-center items-center space-x-2">
                  {creating &&
                    <Spinner className="w-5 h-5 text-green-300" />
                  }
                  <span>Create</span>
                </div>
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 md:px-8 mt-4">
            <div className="text-center sm:text-left">
              <div className={`max-h-96 overflow-y-auto`}>
                <CodeEditor
                  data=""
                  language={"python"}
                  onChange={(e: any) => {
                    formik.setFieldValue("code", e, false);
                  }}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default TemplateNew;
