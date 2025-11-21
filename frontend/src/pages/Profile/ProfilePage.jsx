import React, {useState, useEffect} from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, User, Mail, Building, Phone, MapPin } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'
import InputField from '../../components/ui/InputField'
import TextareaField from '../../components/ui/TextareaField'

const ProfilePage = () => {

    const { isAuthenticated, user, loading, updateUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        businessName: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                businessName: user.businessName || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, profileData);
            updateUser(response.data);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Profile update failed:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    };

    return (
        <div className="bg-white sm:border sm:border-slate-200 sm:rounded-lg sm:shadow-sm overflow-hidden sm:p-6 sm:max-w-4xl sm:mx-auto sm:my-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">My Profile</h3>
            </div>

            <form action="" onSubmit={handleUpdateProfile}>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className='w-5 h-5 text-slate-400' />
                            </div>
                            <input type="email" readOnly value={user?.email || ""} className='w-full h-10 pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 disabled:cursor-not-allowed' disabled />
                        </div>
                    </div>

                    <InputField
                        label="Full Name"
                        name="name"
                        type="text"
                        value={profileData.name}
                        onChange={handleInputChange}
                        icon={User}
                        placeholder="Enter Your Full Name"
                    />

                    <div className="pt-6 border-t border-slate-200 space-y-4">
                        <h4 className="text-lg font-medium text-slate-900">Business Information</h4>
                        <p className="text-sm text-slate-500">This will be used to pre-fill the "Bill From" section of your invoices.</p>
                        <div className="space-y-4">
                            <InputField
                                label="Business Name"
                                name="businessName"
                                type="text"
                                value={profileData.businessName}
                                onChange={handleInputChange}
                                icon={Building}
                                placeholder="My Company LLC"
                            />
                            <TextareaField
                                label="Business Address"
                                name="address"
                                value={profileData.address}
                                onChange={handleInputChange}
                                icon={MapPin}
                                placeholder="1234 Main St, City, State, ZIP"
                            />
                            <InputField
                                label="Phone Number"
                                name="phone"
                                type="tel "
                                value={profileData.phone}
                                onChange={handleInputChange}
                                icon={Phone}
                                placeholder="+(1) 234 567 8900"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button className="inline-flex items-center justify-center px-4 py-2 h-10 bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Profile"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage