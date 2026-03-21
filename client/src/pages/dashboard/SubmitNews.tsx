import { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { databases, storage, DATABASE_ID, COLLECTION_ID_ARTICLES, NOTIFICATIONS_COLLECTION_ID, BUCKET_ID_IMAGES } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, BarChart3, CheckCheck, AlertCircle, Upload, Link as LinkIcon, X } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';

const SubmitNews = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [category, setCategory] = useState('General');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [proofreading, setProofreading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [writerStats, setWriterStats] = useState({
        totalSubmitted: 0,
        avgAccuracy: 0,
        approvedRate: 0
    });

    const fetchWriterStats = useCallback(async () => {
        if (!user?.$id) return;
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                [Query.equal('authorId', user.$id)]
            );
            const total = response.total;
            const approved = response.documents.filter(d => d.status === 'PUBLISHED').length;
            const avgAcc = response.documents.reduce((acc, d) => acc + (d.aiScore || 0), 0) / (total || 1);
            
            setWriterStats({
                totalSubmitted: total,
                avgAccuracy: Math.round(avgAcc),
                approvedRate: total > 0 ? Math.round((approved / total) * 100) : 0
            });
        } catch (err) {
            console.error("Failed to fetch writer stats:", err);
        }
    }, [user?.$id]);

    useEffect(() => {
        fetchWriterStats();
    }, [fetchWriterStats]);

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
                if (data.corrected) {
                    // In a real app, we'd show diffs, but for now we'll just suggest or auto-apply
                    if (window.confirm("AI suggested some improvements. Apply them?")) {
                        setContent(data.corrected_html || data.corrected);
                    }
                } else {
                    alert("Your writing looks great! No significant issues found.");
                }
            }
        } catch (err) {
            console.error("Proofread failed:", err);
            alert("AI Proofreading service is currently unavailable.");
        } finally {
            setProofreading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const plainText = content.replace(/<[^>]*>/g, '');
        if (!plainText.trim()) return alert("Please provide article content.");
        
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 0. Handle File Upload if exists
            let finalImageUrl = imageUrl;
            if (imageFile) {
                try {
                    const uploadedFile = await storage.createFile(
                        BUCKET_ID_IMAGES,
                        ID.unique(),
                        imageFile
                    );
                    // Generate Preview URL
                    const result = storage.getFileView(BUCKET_ID_IMAGES, uploadedFile.$id);
                    finalImageUrl = result.href || result.toString(); // Support both URL object and string
                } catch (err: any) {
                    console.error("Image upload failed:", err);
                    // Continue with fallback image or error
                }
            }

            // 1. AI Check
            let aiResult: any = { result: 'OFFLINE', score: 0 };
            try {
                const response = await fetch(`${AI_SERVER_URL}/detect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: plainText })
                });
                if (response.ok) {
                    aiResult = await response.json();
                } else {
                    aiResult.result = 'OFFLINE';
                }
            } catch (aiError) {
                console.error('AI Service Connection Failed:', aiError);
                aiResult.result = 'OFFLINE';
            }

            // 2. Determine Status
            let status = 'PENDING';
            let userMessage = 'Article submitted successfully! It has been sent for review.';
            let messageType = 'success';
            let finalAiReason = aiResult.analysis?.explanation || '';

            if (aiResult.result === 'OFFLINE') {
                status = 'PENDING';
                userMessage = 'AI Service is currently offline. Your article has been submitted for manual verification by our editors.';
                messageType = 'info';
                finalAiReason = "AI Service was unavailable at time of submission. Manual check required.";
            } else if (aiResult.result === 'FAKE' || aiResult.score < 50) {
                status = 'FLAGGED';
                userMessage = 'Warning: Our AI detected potential misinformation. Your article has been FLAGGED for manual review.';
                messageType = 'warning';
                finalAiReason = aiResult.analysis?.explanation || "AI detected triggers associated with misinformation.";

                try {
                    await databases.createDocument(
                        DATABASE_ID,
                        NOTIFICATIONS_COLLECTION_ID,
                        ID.unique(),
                        {
                            userId: user?.$id,
                            title: 'Article Flagged',
                            message: `Your article "${title}" was flagged by AI as potential misinformation.`,
                            type: 'warning',
                            isRead: false,
                            createdAt: new Date().toISOString()
                        }
                    );
                } catch (e) {}
            }

            // 3. Submit to Database
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                ID.unique(),
                {
                    title,
                    content, // Save HTML content
                    authorId: user?.$id,
                    authorName: user?.name,
                    status: status,
                    aiLabel: String(aiResult.result || 'UNKNOWN').substring(0, 50),
                    aiScore: aiResult.score,
                    createdAt: new Date().toISOString(),
                    sourceUrl: sourceUrl,
                    category: category,
                    imageUrl: finalImageUrl,
                    aiReason: finalAiReason
                }
            );

            setMessage({ type: messageType === 'warning' ? 'error' : 'success', text: userMessage });
            setTitle('');
            setContent('');
            setSourceUrl('');
            setImageUrl('');
            setImageFile(null);
            setImagePreview(null);

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to submit article.' });
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };


    if (loading && writerStats.totalSubmitted === 0) return <LoadingScreen message="Aggregating your writing metrics..." />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Writer Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-xl text-primary-dark">
                        <BarChart3 size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Works</p>
                        <p className="text-3xl font-black text-black">{writerStats.totalSubmitted}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-emerald-100 rounded-xl text-emerald-700">
                        <CheckCheck size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">AI Accuracy</p>
                        <p className="text-3xl font-black text-black">{writerStats.avgAccuracy}%</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-amber-100 rounded-xl text-amber-700">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Approval Rate</p>
                        <p className="text-3xl font-black text-black">{writerStats.approvedRate}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-2xl border-2 border-bg-tertiary p-10 rounded-4xl">
                <h2 className="text-4xl font-black mb-10 border-b-4 border-bg-tertiary pb-4 text-black tracking-tighter">Submit News Article</h2>

                {message.text && (
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '1.5rem',
                        marginBottom: '3rem',
                        backgroundColor: message.type === 'success' ? '#e7ffed' : '#fee2e2',
                        color: message.type === 'success' ? 'var(--color-primary-dark)' : 'var(--color-danger)',
                        border: `3px solid ${message.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)'}`,
                        fontWeight: 900,
                        fontSize: '1.1rem'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div>
                        <label className="block mb-3 text-black text-xl font-black tracking-tight">Article Headline</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enticing and factual headline..."
                            className="w-full p-5 rounded-2xl bg-white border-2 border-bg-tertiary color-black outline-none font-black text-2xl shadow-inner focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-black text-xl font-black tracking-tight">Main Content</label>
                            <button
                                type="button"
                                onClick={handleProofread}
                                disabled={proofreading}
                                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                <Sparkles size={18} className={proofreading ? 'animate-spin' : ''} />
                                {proofreading ? 'AI Proofreading...' : 'Proofread with AI'}
                            </button>
                        </div>
                        <div className="rich-text-editor">
                            <ReactQuill 
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                placeholder="Tell the world what's happening..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                            <label className="block mb-3 text-black text-xl font-black tracking-tight">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-5 rounded-2xl bg-white border-2 border-bg-tertiary color-black outline-none font-black text-lg cursor-pointer"
                            >
                                <option value="General">General</option>
                                <option value="Politics">Politics</option>
                                <option value="Technology">Technology</option>
                                <option value="Health">Health</option>
                                <option value="Sports">Sports</option>
                                <option value="Entertainment">Entertainment</option>
                            </select>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block mb-3 text-black text-xl font-black tracking-tight">Article Cover Image</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* File Upload */}
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className={`w-full aspect-video rounded-3xl border-4 border-dashed cursor-pointer flex flex-col items-center justify-center gap-4 transition-all overflow-hidden relative
                                            ${imagePreview ? 'border-primary bg-primary/5' : 'border-bg-tertiary hover:border-primary/50 bg-white'}
                                        `}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-xl text-danger shadow-lg"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-black text-lg">Upload from Device</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Drag & drop or click to browse</p>
                                                </div>
                                            </>
                                        )}
                                        <input 
                                            id="image-upload"
                                            type="file" 
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                    setImageUrl(''); // Clear URL if file is uploaded
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* URL Fallback */}
                                <div className="flex flex-col justify-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase">
                                        <span className="h-[2px] w-full bg-bg-tertiary"></span>
                                        <span>OR</span>
                                        <span className="h-[2px] w-full bg-bg-tertiary"></span>
                                    </div>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={imageUrl}
                                            onChange={(e) => {
                                                setImageUrl(e.target.value);
                                                setImageFile(null);
                                                setImagePreview(null); // Clear file if URL is pasted
                                            }}
                                            placeholder="Paste image URL instead..."
                                            className="w-full p-5 pl-14 rounded-2xl bg-white border-2 border-bg-tertiary color-black outline-none font-bold text-lg focus:border-primary transition-all shadow-inner"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed px-5 italic">
                                        Tip: Uploaded images look better on the home page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-3 text-black text-xl font-black tracking-tight">Source URL / Citation (Optional)</label>
                        <input
                            type="text"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            placeholder="Link to official reports or primary sources..."
                            className="w-full p-5 rounded-2xl bg-white border-2 border-bg-tertiary color-black outline-none font-bold text-lg"
                        />
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-12 py-5 rounded-4xl font-black text-2xl text-white shadow-2xl transition-all active:scale-95
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-primary/30'}
                            `}
                        >
                            {loading ? 'AI Analysis in Progress...' : 'Submit to Editorial'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitNews;

