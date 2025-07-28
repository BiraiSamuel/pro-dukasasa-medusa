"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ChevronRight, X } from "lucide-react"
import clsx from "clsx"
import { Fragment, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { Region } from "@lib/data/regions"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: Region[] | null }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-gray-900"
                >
                  Menu
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-white m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-lg justify-between p-6"
                  >
                    <div className="flex justify-end">
                      <button data-testid="close-menu-button" onClick={close}>
                        <X />
                      </button>
                    </div>

                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {Object.entries(SideMenuItems).map(([name, href]) => (
                        <li key={name}>
                          <LocalizedClientLink
                            href={href}
                            className="text-3xl leading-10 hover:text-gray-400"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={() => setIsOpen(true)}
                        onMouseLeave={() => setIsOpen(false)}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={{ state: isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
                            regions={regions}
                          />
                        )}
                        <ChevronRight
                          className={clsx(
                            "transition-transform duration-150",
                            isOpen ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <p className="flex justify-between text-sm text-gray-300">
                        © {new Date().getFullYear()} DukaSasa. All rights
                        reserved.
                      </p>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu