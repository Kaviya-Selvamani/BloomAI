import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, updateUserProfile } from '../services/api';
import { UserContext } from '../context/UserContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        grade: '',
    });

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [otherSubject, setOtherSubject] = useState('');

    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const subjectsByGrade = {
        '8': ['Mathematics', 'Science', 'English', 'Social Science'],
        '10': ['Mathematics', 'Science', 'English', 'Social Science'],
        '12': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'grade') {
            setSelectedSubjects([]); // reset when grade changes
            setOtherSubject('');
        }
    };

    const handleSubjectToggle = (subj) => {
        if (selectedSubjects.includes(subj)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
        } else {
            setSelectedSubjects([...selectedSubjects, subj]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const hasOthers = selectedSubjects.includes('Others');
            const cleanedOtherSubject = otherSubject.trim();

            if (selectedSubjects.length === 0) {
                alert('Please select at least one subject.');
                return;
            }

            if (hasOthers && !cleanedOtherSubject) {
                alert('Please enter your other subject.');
                return;
            }

            const subjects = selectedSubjects
                .filter((s) => s !== 'Others')
                .concat(hasOthers ? [cleanedOtherSubject] : []);

            const { data } = await registerUser({ ...formData, subjects });
            // AUTO-LOGIN: Store token and user data immediately
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            try {
                await updateUserProfile({ grade: formData.grade, subjects });
            } catch (e) { console.warn('Could not persist selected subjects after signup', e); }

            alert(`Welcome to BloomAI, ${data.user.name}! Let's start with your personalized diagnostic.`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-neutral-800 p-8 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-neutral-700 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white text-center">Create Account</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Full Name</label>
                        <input type="text" name="name" className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Email</label>
                        <input type="email" name="email" className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Password</label>
                        <input type="password" name="password" className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" onChange={handleInputChange} required />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Grade / Class</label>
                        <select name="grade" className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500" onChange={handleInputChange} required>
                            <option value="">Select Grade</option>
                            <option value="8">Class 8</option>
                            <option value="10">Class 10</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>

                    {formData.grade && subjectsByGrade[formData.grade] && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-2">Select Subjects</label>
                            <div className="flex flex-wrap gap-2">
                                {[...subjectsByGrade[formData.grade], 'Others'].map(subj => (
                                    <button type="button" key={subj} onClick={() => handleSubjectToggle(subj)} className={`px-4 py-2 rounded-lg text-sm transition-colors border ${selectedSubjects.includes(subj) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:border-indigo-400'}`}>
                                        {subj}
                                    </button>
                                ))}
                            </div>
                            {selectedSubjects.includes('Others') && (
                                <div className="mt-3">
                                    <label className="block text-sm text-slate-600 dark:text-neutral-400 mb-1">Other Subject</label>
                                    <input
                                        type="text"
                                        value={otherSubject}
                                        onChange={(e) => setOtherSubject(e.target.value)}
                                        placeholder="Enter your subject"
                                        className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}



                    <button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        Start Diagnostic Quiz
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
