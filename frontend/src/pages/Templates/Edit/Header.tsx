import { Link } from "react-router-dom";
import { MenuAlt2Icon, ReplyIcon } from "@heroicons/react/outline";
import DarkModeSwitch from "../../../components/global/DarkModeSwitch";

interface IHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: any;
}

export default function Header(props: IHeaderProps) {
  const { sidebarOpen, setSidebarOpen } = props;

  return (
    <div className="dark:bg-gray-800 sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r dark:border-gray-900 border-gray-200 text-gray-500 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
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
  )
}
