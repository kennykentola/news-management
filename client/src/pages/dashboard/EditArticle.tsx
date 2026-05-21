import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowLeft, Save } from 'lucide-react';
import { normalizeHtmlForStorage } from '../../lib/content';

const EditArticle = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [catValue, setCatValue] = useState('General');
    const [imageUrl, setImageUrl] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [proofreading, setProofreading] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id);
                setTitle(doc.title);
                setContent(doc.content);
                setCatValue(doc.category || 'General');
                setImageUrl(doc.imageUrl || '');
                setSourceUrl(doc.sourceUrl || '');
                setFeedback(doc.editorFeedback || '');

                if (user && doc.authorId !== user.$id) {
                    alert("You can only edit your own articles.");
                    navigate('/dashboard/my-articles');
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load article");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id, user, navigate]);

    const handleProofread = async () => {
        if (!content.replace(/<[^>]*>/g, '').trim()) return;
        setProofreading(true);
        const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';
        try {
            const response = await fetch(`${AI_SERVER_URL}/proofread`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content.replace(/<[^>]*>/g, '') })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.corrected && window.confirm("AI suggested some improvements. Apply them?")) {
                    setContent(data.corrected);
                }
            }
        } finally {
            setProofreading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);

        try {
            const normalizedContent = normalizeHtmlForStorage(content);
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                id,
                {
                    title,
                    content: normalizedContent,
                    category: catValue,
                    imageUrl,
                    sourceUrl,
                    status: 'PENDING',
                }
            );
            alert("Article updated and resubmitted!");
            navigate('/dashboard/my-articles');
        } catch (e) {
            console.error(e);
            alert("Failed to update article.");
        } finally {
            setSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }, { 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    if (loading) return <div className="p-10 text-center font-black">Loading premium editor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/my-articles')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-black text-black tracking-tighter">Refine Your Article</h2>
            </div>

            {feedback && (
                <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-sm">
                    <p className="text-red-900 font-black mb-1 uppercase tracking-widest text-xs">Editor Feedback</p>
                    <p className="text-red-800 font-bold">{feedback}</p>
                </div>
            )}

            <form onSubmit={handleUpdate} className="bg-white p-10 rounded-4xl border-2 border-bg-tertiary shadow-2xl space-y-8">
                <div>
                    <label className="block mb-2 text-black font-black uppercase text-xs tracking-widest opacity-50">Headline</label>
                    <input
                        value={title} onChange={e => setTitle(e.target.value)} required
                        className="w-full p-4 rounded-xl bg-white border-2 border-bg-tertiary text-black font-black text-xl focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-black font-black uppercase text-xs tracking-widest opacity-50">Category</label>
                        <select
                            value={catValue}
                            onChange={(e) => setCatValue(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white border-2 border-bg-tertiary text-black font-bold outline-none cursor-pointer"
                        >
                            <option value="General">General</option>
                            <option value="Politics">Politics</option>
                            <option value="Technology">Technology</option>
                            <option value="Health">Health</option>
                            <option value="Sports">Sports</option>
                            <option value="Entertainment">Entertainment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-black font-black uppercase text-xs tracking-widest opacity-50">AI Proofing</label>
                        <button
                            type="button"
                            onClick={handleProofread}
                            disabled={proofreading}
                            className="w-full p-4 rounded-xl bg-black text-white font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            <Sparkles size={18} className={proofreading ? 'animate-spin' : ''} />
                            {proofreading ? 'Proofing...' : 'Quick Proofread'}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block mb-4 text-black font-black uppercase text-xs tracking-widest opacity-50">Article Core Content</label>
                    <div className="rich-text-editor">
                        <ReactQuill 
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-black font-black uppercase text-xs tracking-widest opacity-50">Cover Image URL</label>
                        <input
                            value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white border-2 border-bg-tertiary text-black font-bold outline-none"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-black font-black uppercase text-xs tracking-widest opacity-50">Primary Source</label>
                        <input
                            value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white border-2 border-bg-tertiary text-black font-bold outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/my-articles')}
                        className="px-8 py-3 rounded-xl border-2 border-bg-tertiary font-black hover:bg-gray-50 transition-all"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-3 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Publish Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditArticle;

