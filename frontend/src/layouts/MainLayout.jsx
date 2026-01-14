import React from "react";
import { Outlet, Link, NavLink } from "react-router-dom";

function MainLayout() {
    return (
        <div>
            {/* MainLayout navbar */}
            <main>
                <Outlet />
            </main>
            {/* footer */}
        </div>
    );
}

export default MainLayout;
