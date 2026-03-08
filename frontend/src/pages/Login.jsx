import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { loginUser, updateUserProfile } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await loginUser({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            // Persist any local grade/subject selection to server after login
            try {
                const saved = localStorage.getItem('user');
                if (saved) {
                    const local = JSON.parse(saved);
                    const payload = {};
                    if (local.grade) payload.grade = local.grade;
                    if (local.preferredSubject) payload.subjects = [local.preferredSubject];
                    if (Object.keys(payload).length > 0) {
                        await updateUserProfile(payload);
                    }
                }
            } catch (e) { console.warn('Could not persist local preferences after login', e); }
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl w-full max-w-md border border-slate-200 dark:border-neutral-700 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white text-center">Welcome Back</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
