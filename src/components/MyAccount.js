import { useState, useRef } from 'react';
import Image from 'next/image';

function MyAccount() {
    const scrollContainer = useRef(null);

    return (
        <div className="mx-auto max-w-[760px] mt-3 md:mt-6" id="my-account">
            <h1 class="hidden text-title font-medium uppercase mb-10 text-white tracking-wide md:block">Account Information</h1>
            <div class="flex w-full flex-row gap-x-6">
              <div class="relative h-[20px] w-[80px] cursor-pointer gap-10 border border-white/20 hover:border-white/40 lg:h-[104px] lg:w-[104px]">
                <Image
                  src="/avatar.png"
                  alt="profile picture"
                  layout="fill"
                  objectFit="cover"
                />
                <input className="hidden" type="file" accept="image/*" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg uppercase leading-4 text-white tracking-wide">douvy</span>
                <span className="text-2xs uppercase tracking-wide text-white/60">0123456789abcdef0123456789abcdef01234567</span>
                <div className="mt-auto">
                  <div className="flex flex-row gap-4">
                    <button className="relative whitespace-nowrap px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border border-transparent text-white btn-gray bg-transparent">Change</button>
                    <button className="relative whitespace-nowrap px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 border border-red text-red btn-red bg-transparent hover:text-black">Remove</button>
                  </div>
                </div>
              </div>
              <input type="hidden" name="delete" value="false" />
            </div>

            <div class="flex w-full flex-row gap-x-6 mt-10">
                <form className="flex w-full max-w-measure flex-col">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-white font-semibold capitalize tracking-wide flex w-full flex-col items-stretch justify-center">
                      <label className="flex cursor-pointer flex-col gap-2" htmlFor="username">
                        <div className="flex items-center justify-between">
                          <p className="flex items-center justify-start gap-2 px-0.5">Username*</p>
                        </div>
                        <div className="relative">
                          <input type="text" value="douvy" className="h-10 w-full border-2 bg-dark-gray py-2 px-4 text-sm outline-none bg-transparent text-white" name="username" id="username"/>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="gap-2 mt-5 text-sm text-white font-semibold capitalize flex w-full flex-col items-stretch justify-center">
                      <label className="flex cursor-pointer flex-col gap-2" htmlFor="email">
                        <div className="flex items-center justify-between">
                          <p className="flex items-center justify-start gap-2 px-0.5 tracking-wide">Todoist API key</p>
                        </div>
                        <div className="relative">
                          <input type="text" value="0123456789ABCDEF0123456789ABCDEF01234567" className="h-10 w-full border-2 bg-dark-gray py-2 px-4 text-sm outline-none bg-transparent text-white" name="todoist-api" id="todoist-api" />
                        </div>
                      </label>
                    </div>
                  </div>
                  <button className="relative mt-6 px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 bg-transparent hover:text-black px-6 py-2">
                    Save Changes
                  </button>
                </form>
            </div>
        </div>
    );
}

export default MyAccount;