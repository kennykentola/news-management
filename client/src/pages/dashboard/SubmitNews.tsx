import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { databases, storage, DATABASE_ID, COLLECTION_ID_ARTICLES, NOTIFICATIONS_COLLECTION_ID, BUCKET_ID_IMAGES } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, BarChart3, CheckCheck, AlertCircle, Upload, Link as LinkIcon, X, Info, Zap } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import { normalizeHtmlForStorage } from '../../lib/content';

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';
const MAX_CONTENT_LENGTH = 49500; // Buffer for 50k schema expansion

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
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const quillRef = useRef<any>(null);
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

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return alert("Please enter a topic or prompt for the AI to write about.");
        setIsGenerating(true);
        const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';
        try {
            const response = await fetch(`${AI_SERVER_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: aiPrompt })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.headline && data.content) {
                    setTitle(data.headline);
                    setContent(data.content);
                    setMessage({ type: 'success', text: 'AI successfully generated an article for you!' });
                    setAiPrompt('');
                } else {
                    setMessage({ type: 'error', text: data.error || 'Failed to generate content.' });
                }
            } else {
                let errorMsg = 'AI Service is currently unavailable.';
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                } catch (e) {}
                
                // If the error contains 503, it's Gemini's servers
                if (errorMsg.includes('503') || errorMsg.includes('Service Unavailable')) {
                    errorMsg = 'Google Gemini API is currently overloaded or unavailable. Please try again in a few moments.';
                }
                
                setMessage({ type: 'error', text: errorMsg });
            }
        } catch (err) {
            console.error("AI Generation failed:", err);
            setMessage({ type: 'error', text: 'AI Service is currently unavailable.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation Checks
        const normalizedContent = normalizeHtmlForStorage(content);
        const plainText = normalizedContent.replace(/<[^>]*>/g, '');
        if (!plainText.trim()) return alert("Please provide article content.");

        if (normalizedContent.length > MAX_CONTENT_LENGTH) {
            return alert(`Manuscript is too large (${normalizedContent.length.toLocaleString()} characters). Please reduce content or inline media to stay below ${MAX_CONTENT_LENGTH.toLocaleString()} characters.`);
        }
        
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
                    finalImageUrl = result.toString(); // Appwrite 21+ returns a URL object or string, .toString() covers both
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
                    content: normalizedContent, // Save normalized HTML content
                    authorId: user?.$id,
                    authorName: user?.name,
                    status: status,
                    aiLabel: String(aiResult.result || 'UNKNOWN').substring(0, 50),
                    aiScore: aiResult.score,
                    createdAt: new Date().toISOString(),
                    sourceUrl: sourceUrl,
                    category: category,
                    imageUrl: finalImageUrl,
                    aiReason: finalAiReason,
                    aiCredibility: aiResult.credibility || (aiResult.score * 0.95), // Mock fallback
                    aiClassification: aiResult.classification || (aiResult.result === 'FAKE' ? 'FAKE' : 'REAL'),
                    aiEdgeCases: aiResult.edge_cases && aiResult.edge_cases.trim() !== '' ? aiResult.edge_cases : 'None detected'
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

    // High-Fidelity Social Embed Handler
    const socialHandler = useCallback(() => {
        const url = window.prompt("Enter Social Media URL (Twitter/X):");
        if (!url) return;

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        
        // High-Fidelity Social Card Parchment
        if (url.includes('twitter.com') || url.includes('x.com')) {
            const tweetHtml = `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`;
            quill.clipboard.dangerouslyPasteHTML(range.index, tweetHtml);
        } else {
            alert("Currently, only Twitter/X embeds are supported for high-fidelity rendering.");
        }
    }, []);

    // High-Fidelity Image Synergy Handler
    const imageHandler = useCallback(async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                setLoading(true);
                const uploadedFile = await storage.createFile(
                    BUCKET_ID_IMAGES,
                    ID.unique(),
                    file
                );
                const fileUrl = storage.getFilePreview(
                    BUCKET_ID_IMAGES,
                    uploadedFile.$id,
                    800,
                    600,
                    'center' as any,
                    100
                ).toString();

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', fileUrl);
            } catch (err) {
                console.error('Inline image upload failed:', err);
                alert('Failed to upload inline image asset.');
            } finally {
                setLoading(false);
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: socialHandler // Re-purposing video tool for Social Embeds or adding a new tool
            }
        },
    }), [imageHandler]);


    if (loading && writerStats.totalSubmitted === 0) return <LoadingScreen message="Aggregating your writing metrics..." />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Writer Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-bg-secondary p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-xl text-primary-dark dark:text-primary">
                        <BarChart3 size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-text-secondary uppercase tracking-widest">Total Works</p>
                        <p className="text-3xl font-black text-text-primary">{writerStats.totalSubmitted}</p>
                    </div>
                </div>
                <div className="bg-bg-secondary p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-emerald-100/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <CheckCheck size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-text-secondary uppercase tracking-widest">AI Accuracy</p>
                        <p className="text-3xl font-black text-text-primary">{writerStats.avgAccuracy}%</p>
                    </div>
                </div>
                <div className="bg-bg-secondary p-6 rounded-2xl border-2 border-bg-tertiary shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-amber-100/10 rounded-xl text-amber-600 dark:text-amber-400">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-text-secondary uppercase tracking-widest">Approval Rate</p>
                        <p className="text-3xl font-black text-text-primary">{writerStats.approvedRate}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-bg-secondary shadow-2xl border-2 border-bg-tertiary p-10 rounded-4xl">
                <h2 className="text-4xl font-black mb-10 border-b-4 border-bg-tertiary pb-4 text-text-primary tracking-tighter">Submit News Article</h2>

                {message.text && (
                    <div className={`p-6 rounded-3xl mb-12 font-black text-lg border-4 ${message.type === 'success' ? 'bg-[#e7ffed] text-primary-dark border-primary' : 'bg-red-100 text-danger border-danger'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* AI Auto-Writer Panel */}
                    <div className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                        <Sparkles className="absolute -bottom-4 -right-4 text-primary/10 w-48 h-48 rotate-12 transition-transform group-hover:scale-110" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1 w-full">
                                <label className="block mb-2 text-primary font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={16} /> NewsGuard AI Writer
                                </label>
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Enter a topic, fact, or prompt (e.g., 'The impact of AI on modern journalism')"
                                    className="w-full p-4 rounded-xl bg-bg-primary border-2 border-bg-tertiary text-text-primary outline-none font-bold text-lg focus:border-primary transition-all"
                                    disabled={isGenerating}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiPrompt.trim()}
                                className="w-full md:w-auto mt-4 md:mt-0 whitespace-nowrap bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} /> Auto-Write
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-3 text-text-primary text-xl font-black tracking-tight">Article Headline</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enticing and factual headline..."
                            className="w-full p-5 rounded-2xl bg-bg-primary border-2 border-bg-tertiary text-text-primary outline-none font-black text-2xl shadow-inner focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-text-primary text-xl font-black tracking-tight">Main Content</label>
                            <button
                                type="button"
                                onClick={handleProofread}
                                disabled={proofreading}
                                className="flex items-center gap-2 px-6 py-2 bg-text-primary text-bg-primary rounded-xl font-black text-sm hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                <Sparkles size={18} className={proofreading ? 'animate-spin' : ''} />
                                {proofreading ? 'AI Proofreading...' : 'Proofread with AI'}
                            </button>
                        </div>
                        <div className="rich-text-editor relative">
                            <ReactQuill 
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                placeholder="Tell the world what's happening..."
                            />
                            
                            {/* High-Fidelity Character Pulse */}
                            <div className="absolute -bottom-8 right-2 flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${content.length > MAX_CONTENT_LENGTH ? 'text-danger animate-pulse' : 'text-text-secondary/50'}`}>
                                    Manuscript Load: {content.length.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
                                </span>
                                {content.length > MAX_CONTENT_LENGTH && (
                                    <span title="Limit approached. Excessive inline media or text detected.">
                                        <Info size={12} className="text-danger" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                            <label className="block mb-3 text-text-primary text-xl font-black tracking-tight">Category</label>
                            <select
                                title="Article Category"
                                aria-label="Article Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-5 rounded-2xl bg-bg-primary border-2 border-bg-tertiary text-text-primary outline-none font-black text-lg cursor-pointer"
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
                                                    title="Remove Image"
                                                    aria-label="Remove Image"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute top-4 right-4 bg-bg-primary/90 p-2 rounded-xl text-danger shadow-lg"
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
                                                    <p className="font-black text-lg text-text-primary">Upload from Device</p>
                                                    <p className="text-xs text-text-secondary/50 font-bold uppercase tracking-wider">Drag & drop or click to browse</p>
                                                    <Zap size={14} className="text-primary fill-primary/20" />
                                                </div>
                                            </>
                                        )}
                                        <input 
                                            id="image-upload"
                                            title="Upload Image"
                                            aria-label="Upload Image"
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
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
                                        <input
                                            type="text"
                                            value={imageUrl}
                                            onChange={(e) => {
                                                setImageUrl(e.target.value);
                                                setImageFile(null);
                                                setImagePreview(null); // Clear file if URL is pasted
                                            }}
                                            placeholder="Paste image URL instead..."
                                            className="w-full p-5 pl-14 rounded-2xl bg-bg-primary border-2 border-bg-tertiary text-text-primary outline-none font-bold text-lg focus:border-primary transition-all shadow-inner"
                                        />
                                    </div>
                                    <p className="text-xs text-text-secondary/50 font-bold leading-relaxed px-5 italic">
                                        Tip: Uploaded images look better on the home page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-3 text-text-primary text-xl font-black tracking-tight">Source URL / Citation (Optional)</label>
                        <input
                            type="text"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            placeholder="Link to official reports or primary sources..."
                            className="w-full p-5 rounded-2xl bg-bg-primary border-2 border-bg-tertiary text-text-primary outline-none font-bold text-lg"
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

