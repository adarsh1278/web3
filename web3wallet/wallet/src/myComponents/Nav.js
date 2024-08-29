import { ModeToggle } from "./darkmode"


export default function Nav(){
    return(
        <div className="  shadow-sm w-screen  p-3   fixed h-12  z-10  flex  justify-start  bg-slate-50 dark:bg-gray-800 items-center">
            <div className=" mx-7  text-2xl text-blue-500 font-serif">Welcome</div>
            <div className="flex  w-full justify-end px-7">
            <ModeToggle></ModeToggle>
            </div>
        </div>
    )
}