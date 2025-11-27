// import React, {useState} from 'react'
// import {
//     Eye,
//     EyeOff,
//     Loader2,
//     Mail,
//     Lock,
//     FileText,
//     ArrowRight
// } from "lucide-react";
// import { API_PATHS } from '../../utils/apiPaths';
// import { useAuth } from '../../context/AuthContext';
// import axiosInstance from '../../utils/axiosInstance';
// import { useNavigate } from 'react-router-dom';
// import { validateEmail, validatePassword } from '../../utils/helper';
// import GoogleSignIn from '../../components/auth/GoogleSignIn';
// // import GoogleSignIn from '../../components/auth/GoogleSignIn';

// const Login = () => {

//     const {login} = useAuth();
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//     });
//     const [showPassword, setShowPassword] = useState(false)
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [fieldErrors, setFieldErrors] = useState({
//         email: "",
//         password: "",
//     });
//     const [touched, setTouched] = useState({
//         email: false,
//         password: false,
//     });

//     const handleInputChange = (e) => {
//         const {name, value} = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));

//         // Real-time validation
//         if (touched[name]) {
//             const newFieldErrors = {...fieldErrors};
//             if (name === "email") {
//                 newFieldErrors.email = validateEmail(value);
//             } else if (name === "password") {
//                 newFieldErrors.password = validatePassword(value);
//             }
//             setFieldErrors(newFieldErrors)
//         }

//         if (error) setError("")
//     };

//     const handleBlur = (e) => {
//         const {name} = e.target;
//         setTouched((prev) => ({
//             ...prev,
//             [name]: true,
//         }))

//         // Validate on blur
//         const newFieldErrors = {...fieldErrors};
//         if (name === "email") {
//             newFieldErrors.email = validateEmail(formData.email);
//         } else if (name === "password") {
//             newFieldErrors.password = validatePassword(formData.password);
//         }
//         setFieldErrors(newFieldErrors)
//     };

//     const isFormValid = () => {
//         const emailError = validateEmail(formData.email);
//         const passwordError = validatePassword(formData.password);
//         return !emailError && !passwordError && formData.email && formData.password;
//     };

//     const handleSubmit = async () => {
//         // Validate all fields before submission
//         const emailError = validateEmail(formData.email);
//         const passwordError = validatePassword(formData.password);

//         if (emailError || passwordError) {
//             setFieldErrors({
//                 email: emailError,
//                 password: passwordError,
//             });
//             setTouched({
//                 email: true,
//                 password: true,
//             });
//             return;
//         }

//         setIsLoading(true);
//         setError("");
//         setSuccess("");

//         try {
//             const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);

//             if (response.status === 200) {
//                 const { token } = response.data;

//                 if (token) {
//                     setSuccess("Login Successful!")
//                     login(response.data, token);
//                     navigate("/dashboard");

//                     // Redirect based on role
//                     // setTimeout(() => {
//                     //     window.location.href = "/dashboard"
//                     // }, 2000);
//                 } 
//             } else {
//                 setError(response.data.message || "Invalid Credentials!")
//             }
//         } catch (error) {
//             if (error.response && error.response.data && error.response.data.message) {
//                 setError(error.response.data.message);
//             } else {
//                 setError("An error occurred during login.")
//             }
//         } finally {
//             setIsLoading(false)
//         }
//     };

//     return (
//         <div className="min-h-screen bg-white flex items-center justify-center px-4">
//             <div className="w-full max-w-sm">
//                 {/* Header */}
//                 <div className="text-center mb-8">
//                     <div className="w-12 h-12 bg-linear-to-r from-blue-950 to-blue-900 rounded-xl mx-auto mb-6 flex items-center justify-center">
//                         <FileText className='text-white w-6 h-6' />
//                     </div>
//                     <h1 className="text-2xl font-semibold text-gray-900 mb-2">
//                         Login to Your Account
//                     </h1>
//                     <p className="text-gray-600 text-sm">
//                         Welcome back to SmartInvoice+
//                     </p>
//                 </div>

//                 {/* Form */}
//                 <div className="space-y-4">
//                     {/* Email */}
//                     <div className="">
//                         <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-2">
//                             Email
//                         </label>
//                         <div className="relative">
//                             <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5' />
//                             <input 
//                                 name='email'
//                                 type='email'
//                                 required
//                                 value={formData.email}
//                                 onChange={handleInputChange} 
//                                 onBlur={handleBlur}
//                                 className={`w-full pl-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
//                                     fieldErrors.email && touched.email
//                                     ? "border-red-300 focus:ring-red-500"
//                                     : "border-gray-300 focus:ring-black"
//                                 }`} 
//                                 placeholder='Enter your email'
//                             />
//                         </div>
//                         {
//                             fieldErrors.email && touched.email && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {fieldErrors.email}
//                                 </p>
//                             )
//                         }
//                     </div>

//                     {/* Password */}
//                     <div className="">
//                         <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-2">
//                             Password
//                         </label>
//                         <div className="relative">
//                             <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5' />
//                             <input 
//                                 name='password'
//                                 type={showPassword ? "text" : "password"}
//                                 required
//                                 value={formData.password}
//                                 onChange={handleInputChange}
//                                 onBlur={handleBlur}
//                                 className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
//                                     fieldErrors.password && touched.password
//                                     ? "border-red-300 focus:ring-red-500"
//                                     : "border-gray-300 focus:ring-black"
//                                 }`}
//                                 placeholder='Enter your password'
//                             />
//                             <button
//                                 type='button'
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
//                             >
//                                 {
//                                     showPassword ? (
//                                         <EyeOff className='w-5 h-5' />
//                                     ) : (
//                                         <Eye className='w-5 h-5' />
//                                     )
//                                 }
//                             </button>
//                         </div>
//                         {
//                             fieldErrors.password && touched.password && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {fieldErrors.password}
//                                 </p>
//                             )
//                         }
//                     </div>

//                     {/* Error/Success Messages */}
//                     {
//                         error && (
//                             <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                                 <p className="text-red-600 text-sm">{error}</p>
//                             </div>
//                         )
//                     }

//                     {
//                         success && (
//                             <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                                 <p className="text-green-600 text-sm">{success}</p>
//                             </div>
//                         )
//                     }
//                     {/* Sign In Button */}
//                     <button
//                         onClick={handleSubmit}
//                         disabled={isLoading || !isFormValid()}
//                         className='w-full bg-linear-to-r from-blue-950 to-blue-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center group'
//                     >
//                         {
//                             isLoading ? (
//                                 <>
//                                     <Loader2 className='w-4 h-4 mr-2 animate-spin' />
//                                     Signing in...
//                                 </>
//                             ) : (
//                                 <>
//                                     Sign in
//                                     <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
//                                 </>
//                             )
//                         }
//                     </button>
//                 </div>

//                 {/* Footer */}
//                 <div className="mt-6 pt-4 border-t border-gray-200 text-center">
//                     <p className="text-sm text-gray-600">
//                         Don't have an account?{" "}
//                         <button
//                             className='text-black font-medium hover:underline cursor-pointer'
//                             onClick={() => navigate("/signup")}
//                         >
//                             Sign up
//                         </button>
//                     </p>
//                     <GoogleSignIn />
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Login



// pages/auth/Login.jsx

import React, {useState} from 'react'
import {
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    FileText,
    ArrowRight
} from "lucide-react";
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/helper';
import GoogleSignIn from '../../components/auth/GoogleSignIn';

const Login = () => {

    const {login} = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: "",
    });
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (touched[name]) {
            const newFieldErrors = {...fieldErrors};
            if (name === "email") {
                newFieldErrors.email = validateEmail(value);
            } else if (name === "password") {
                newFieldErrors.password = validatePassword(value);
            }
            setFieldErrors(newFieldErrors)
        }

        if (error) setError("")
    };

    const handleBlur = (e) => {
        const {name} = e.target;
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }))

        const newFieldErrors = {...fieldErrors};
        if (name === "email") {
            newFieldErrors.email = validateEmail(formData.email);
        } else if (name === "password") {
            newFieldErrors.password = validatePassword(formData.password);
        }
        setFieldErrors(newFieldErrors)
    };

    const isFormValid = () => {
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        return !emailError && !passwordError && formData.email && formData.password;
    };

    const handleSubmit = async () => {
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        if (emailError || passwordError) {
            setFieldErrors({
                email: emailError,
                password: passwordError,
            });
            setTouched({
                email: true,
                password: true,
            });
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);

            if (response.status === 200) {
                const { token } = response.data;

                if (token) {
                    setSuccess("Login Successful!")
                    login(response.data, token);
                    navigate("/dashboard");
                } 
            } else {
                setError(response.data.message || "Invalid Credentials!")
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An error occurred during login.")
            }
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-purple-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Login to Your Account
                    </h2>
                    <p className="text-blue-100">
                        Welcome back to SmartInvoice+
                    </p>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                    fieldErrors.email && touched.email
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-blue-500"
                                }`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {fieldErrors.email && touched.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                    fieldErrors.password && touched.password
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-300 focus:border-blue-500"
                                }`}
                                placeholder="Enter your password"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {fieldErrors.password && touched.password && (
                            <p className="text-red-600 text-sm mt-1">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                        <Link 
                            to="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    {/* Sign In Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isLoading}
                        className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Google Sign In */}
                    <GoogleSignIn />
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 text-center space-y-3">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <button 
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                            onClick={() => navigate("/signup")}
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login