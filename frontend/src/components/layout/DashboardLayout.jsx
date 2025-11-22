import React, {useState, useEffect} from 'react'
import {
    ArrowDown,
    ArrowDown01,
    ArrowDown01Icon,
    ArrowDown10,
    ArrowDown10Icon,
    ArrowDownAZ,
    ArrowDownCircle,
    Briefcase,
    ChevronDown,
    LogOut,
    Menu,
    X
} from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import { NAVIGATION_MENU } from '../../utils/data'


const NavigationItem = ({item, isActive, onClick, isCollapsed}) => {
    const Icon = item.icon;

    return (
        <button 
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                ? "bg-blue-50 text-blue-900 shadow-sm shadow-blue-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => onClick(item.id)}
        >
            <Icon 
                className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-blue-900" : "text-gray-500"
                }`}
            />
            {!isCollapsed && <span className="ml-4 truncate">{item.name}</span> }
        </button>
    )
}

const DashboardLayout = ({children, activeMenu}) => {

    const {user, logout} = useAuth()
    const navigate = useNavigate()

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard")
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // const [ invoiceDropdownOpen, setInvoiceDropdownOpen ] = useState([]);

    // The above can also be an object if multiple dropdowns are needed
    const [ dropdownsOpen, setDropdownsOpen ] = useState({
        invoices: false,
        receipts: false,
    });


    // Handle responsive bahavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (profileDropdownOpen) {
                setProfileDropdownOpen(false)
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [profileDropdownOpen])

    const handleNavigation = (itemId) => {
        setActiveNavItem(itemId)
        navigate(`/${itemId}`);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const sidebarCollapsed  = !isMobile && false;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
                isMobile
                    ? sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    : "translate-x-0"
                } ${
                    sidebarCollapsed ? "w-16" : "w-64"
                } bg-white border-r border-gray-200`}
            >
                {/* Company Logo */}
                <div className="flex items-center h-16 border-b border-gray-200 px-4">
                    <Link className='flex items-center space-x-3' to={"/dashboard"}>
                        <div className="h-8 w-8 bg-linear-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                            <Briefcase className='h-5 w-5 text-white' />
                        </div>
                        {!sidebarCollapsed && <span className="text-gray-900 font-bold text-xl">SmartInvoice+</span> }
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {NAVIGATION_MENU.map((menu) => (
                        menu.items ? (
                            <div key={menu.id} className="space-y-1">
                                {!sidebarCollapsed && (
                                    // <div className='flex items-center justify-between'>
                                        <button 
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 }`}
                                            // onClick={() => setInvoiceDropdownOpen(!invoiceDropdownOpen)}
                                            // onClick={() => {
                                            //     if (invoiceDropdownOpen === menu.id) {
                                            //         setInvoiceDropdownOpen(null);
                                            //     } else {
                                            //         setInvoiceDropdownOpen(menu.id);
                                            //     }
                                            // }}
                                            onClick={() => {
                                                setDropdownsOpen((prev) => ({
                                                    ...prev,
                                                    [menu.id]: !prev[menu.id],
                                                }));
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <menu.icon
                                                    className={`h-5 w-5 shrink-0 text-gray-500}`}
                                                />
                                                {!sidebarCollapsed && <span className="ml-4 truncate">{menu.id}</span> }
                                            </div>
                                            <div className="">
                                                <ChevronDown className='h-4 w-4 text-gray-400' />
                                            </div>
                                        </button>
                                )}

                                {
                                    (dropdownsOpen[menu.id] || sidebarCollapsed) && (
                                        <div className={`pl-3 mt-1 space-y-1 ${sidebarCollapsed ? "hidden" : ""}`}>
                                            {menu.items.map((item) => (
                                                <NavigationItem 
                                                    key={item.id}
                                                    item={item}
                                                    isActive={activeNavItem === item.id}
                                                    onClick={handleNavigation}
                                                    isCollapsed={sidebarCollapsed}
                                                />
                                            ))}
                                        </div>
                                    )
                                }

                                {/* {
                                    (invoiceDropdownOpen === menu.id || sidebarCollapsed) && (
                                        <div className={`pl-3 mt-1 space-y-1 ${sidebarCollapsed ? "hidden" : ""}`}>
                                            {menu.items.map((item) => (
                                                <NavigationItem 
                                                    key={item.id}
                                                    item={item}
                                                    isActive={activeNavItem === item.id}
                                                    onClick={handleNavigation}
                                                    isCollapsed={sidebarCollapsed}
                                                />
                                            ))}
                                        </div>
                                    )
                                } */}

                                {/* {
                                    invoiceDropdownOpen && !sidebarCollapsed && (
                                        <div className="pl-3 mt-1 space-y-1">
                                            {menu.items.map((item) => (
                                                <NavigationItem 
                                                    key={item.id}
                                                    item={item}
                                                    isActive={activeNavItem === item.id}
                                                    onClick={handleNavigation}
                                                    isCollapsed={sidebarCollapsed}
                                                />
                                            ))}
                                        </div>
                                    )
                                } */}


                            </div>
                        ) : (   
                            <NavigationItem 
                                key={menu.id}
                                item={menu}
                                isActive={activeNavItem === menu.id}
                                onClick={handleNavigation}
                                isCollapsed={sidebarCollapsed}
                            />
                        )
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-4 left-4 right-4" >
                    <button 
                        className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300"
                        onClick={logout}
                    >
                        <LogOut className='h-5 w-5 shrink-0 text-gray-500' />
                        {!sidebarCollapsed && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Mobile overlay */}
            {
                isMobile && sidebarOpen && (
                    <div 
                        className='fixed inset-0 bg-black/10 bg-opacity-25 z-40 backdrop-blur-sm'
                        onClick={() => setSidebarOpen(false)}
                    />
                )
            }

            {/* Main Content */}
            <div 
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
                }`}
            >
                {/* Top Navbar */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center space-x-4">
                        {isMobile && (
                            <button 
                                onClick={toggleSidebar}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            >
                                {sidebarOpen ? (
                                    <X className='h-5 w-5 text-gray-600' />
                                ) : (
                                    <Menu className='h-5 w-5 text-gray-600' />
                                )}
                            </button>
                        )}
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-sm text-gray-500 hidden sm:block">
                                Here's your invoice overview.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Profile dropdown */}
                        <ProfileDropdown 
                            isOpen={profileDropdownOpen}
                            onToggle={(e) => {
                                e.stopPropagation();
                                setProfileDropdownOpen(!profileDropdownOpen);
                            }}
                            avatar={user?.logo || ""}
                            companyName={user?.name || ""}
                            email={user?.email || ""}
                            onLogout={logout}
                        />
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    )
}

export default DashboardLayout