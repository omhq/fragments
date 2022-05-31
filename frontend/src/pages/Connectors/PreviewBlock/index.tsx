import { useState } from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/outline";
import { truncateStr } from "../../../utils/utils";
import { checkHttpStatus } from "../../../utils/api/helpers";
import { connectorHttpDelete } from "../../../utils/api/connectors";
import { connectorDeleted } from "../../../reducers/main";
import { IConnector } from "../../../types";
import { toaster } from "../../../utils/utils";
import ConfirmDelete from "../../../components/modals/ConfirmDelete";

interface IPreviewBlockProps {
  dispatch: any;
  data: IConnector;
}

const PreviewBlock = (props: IPreviewBlockProps) => {
  const { dispatch, data } = props;
  const [isHovering, setIsHovering] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const objId = data.id;

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const onDeleteTemplate = () => {
    setShowDeleteConfirmModal(true);
  };

  const onDeleteTemplateConfirmed = () => {
    connectorHttpDelete(objId)
    .then(checkHttpStatus)
    .then(() => {
      dispatch(connectorDeleted(objId));
      toaster("deleted", "success");
    })
    .catch(e => {
      toaster(e, "error");
    })
    .finally(() => {
      setShowDeleteConfirmModal(false);
    })
  };

  return (
    <>
      <div
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        key={data.id}
        className={`
          relative
          rounded-lg
          dark:bg-gray-900
          bg-gray-100
          px-6
          py-5
          shadow-sm
          flex
          items-center
          space-x-3
          hover:border-gray-400
        `}
      >
        <div className="flex-1 min-w-0">
          {truncateStr(data.name, 25)}
        </div>

        {isHovering &&
          <div className="flex space-x-1 absolute top-2 right-2">
            <button
              onClick={() => onDeleteTemplate()}
              className="flex justify-center items-center p-2 hover:bg-gray-100 shadow bg-white rounded-md"
            >
              <TrashIcon className="w-3 h-3 text-red-500 hover:text-red-600" />
            </button>

            <Link
              to={`/connectors/${objId}`}
              className="flex justify-center items-center p-2 hover:bg-gray-100 shadow bg-white rounded-md"
            >
              <PencilIcon className="w-3 h-3 text-gray-500 hover:text-gray-600" />
            </Link>
          </div>
        }
      </div>

      {showDeleteConfirmModal &&
        <ConfirmDelete
          onConfirm={() => {
            onDeleteTemplateConfirmed();
          }}
          setClose={() => {
            setShowDeleteConfirmModal(false);
          }}
        />
      }
    </>
  )
}

export default PreviewBlock;
