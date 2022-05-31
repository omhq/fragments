import { Fragment, useState, createRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BeakerIcon, ChevronDownIcon, GlobeIcon, XCircleIcon } from "@heroicons/react/solid";
import { ICache } from "../../../types";
import {
  runTest,
  runDeploy,
  runUnDeploy
} from "../../../reducers/main";
import useClickOutside from "../../../partials/useClickOutside";
import Spinner from "../../../components/global/Spinner";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface IActionsDropDownProps {
  dispatch: any;
  state: any;
  prodCache: ICache | null;
  templateId: number;
}

export default function ActionsDropDown(props: IActionsDropDownProps) {
  const { dispatch, state, prodCache, templateId } = props;
  const [open, setOpen] = useState(false);
  const ref = createRef<HTMLDivElement>();

  const onTest = () => {
    if (templateId) {
      dispatch(runTest(templateId));
    }
  };

  const onUndeploy = () => {
    if (templateId) {
      dispatch(runUnDeploy(templateId));
    }
  };

  const onDeploy = () => {
    if (templateId) {
      dispatch(runDeploy(templateId));
    }
  };

  useClickOutside(ref, () => {
    setOpen(false);
  });

  return (
    <div className="flex items-center justify-end">
      <div ref={ref}>
        <Menu as="div" className="flex relative inline-block text-left">
          {() => (
            <>
              <div className="flex items-center">
                <Menu.Button onClick={() => setOpen(!open)} className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:w-auto text-sm">
                  <span className="sr-only">Actions</span>
                  Actions
                  <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                show={open}
              >
                <Menu.Items static className="origin-top-right absolute right-0 mt-8 w-52 rounded-md shadow-lg bg-white focus:outline-none z-20">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={onTest}
                          type="button"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                          disabled={(state.testing || state.deploying || state.undeploying)}
                        >
                          <div className="flex items-center space-x-2">
                            {(state.testing)
                              ?
                                <>
                                  <Spinner className="w-4 h-4 text-blue-300" />
                                  <span>Testing...</span>
                                </>
                              :
                                <>
                                  <BeakerIcon className="w-4 h-4 text-gray-500" />
                                  <span>Test</span>
                                </>
                            }
                          </div>
                        </button>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={onDeploy}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                          disabled={(state.testing || state.deploying || state.undeploying)}
                        >
                          <div className="flex items-center space-x-2">
                            {state.deploying
                              ?
                                <>
                                  <Spinner className="w-4 h-4 text-blue-300" />
                                  <span>Deploying...</span>
                                </>
                              :
                                <>
                                  <GlobeIcon className="w-4 h-4 text-gray-500" />
                                  <span>Deploy</span>
                                </>
                            }
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                    
                    {(prodCache && prodCache.public === 1) &&
                      <Menu.Item>
                        {({ active }: { active: boolean }) => (
                          <button
                            onClick={onUndeploy}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm w-full text-left'
                            )}
                            disabled={(state.testing || state.deploying || state.undeploying)}
                          >
                            <div className="flex items-center space-x-2">
                              {state.undeploying
                                ?
                                  <>
                                    <Spinner className="w-4 h-4 text-blue-300" />
                                    <span>Undeploying...</span>
                                  </>
                                :
                                  <>
                                    <XCircleIcon className="w-4 h-4 text-gray-500" />
                                    <span>Undeploy</span>
                                  </>
                              }
                            </div>
                          </button>
                        )}
                      </Menu.Item>
                    }
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}
