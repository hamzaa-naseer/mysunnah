"use client"

import dynamic from "next/dynamic";
import { Drawer } from "antd";

const MobileMenus = dynamic(() => import('./MobileSidebar/MobileMenus'), { ssr: false })
const Logo = dynamic(() => import('../Logo/Logo'), { ssr: false })

const Sidebar = ({ isActive, setIsActive, image }) => {
  return (
    <>
     <Drawer
                placement="right"
                closable={true}
                open={isActive}
                key="right"
            > 
                <div
        className={` tpsideinfo tp-side-info-area ${isActive ? "tp-sidebar-opened" : ""
          }`}
      >
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <Logo image={image} isActive={isActive} setIsActive={setIsActive} />
          </div>
          <div className="mobile-menu-close">
            <button className=" toggle" onClick={() => setIsActive(false)}>
              <i className="icon-top"></i>
              <i className="icon-bottom"></i>
            </button>
          </div>
        </div>

        <div className="mobile-menu mean-container d-block d-xl-none">
          <div className="mean-bar">
            <MobileMenus isActive={isActive} setIsActive={setIsActive} />
          </div>
        </div>
      </div>

      <div
        onClick={() => setIsActive(false)}
        className={`body-overlay ${isActive ? "opened" : ""}`}
      ></div>
                </Drawer>

    </>
  );
};

export default Sidebar;
